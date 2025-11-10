import path from 'path';
import sharp from 'sharp';
import prisma from '../lib/prisma.js';

import { asyncHandler } from '../lib/async-handler.js';
import { getHomepageData } from '../lib/index-data.js';
import { ALLOWED_FILE_TYPES } from '../lib/constants.js';
import { configureSupabase } from '../config/supabase.js';
import { throwSupabaseError } from '../lib/supabase-helpers.js';
import {
  CustomBadRequestError,
  CustomInternalError,
  CustomNotFoundError,
} from '../errors/index.js';

import { generateVideoThumbnail, getVideoMetadata } from '../lib/utils.js';

const supabase = configureSupabase();

export const handleGetFiles = asyncHandler(async (req, res) => {
  const query = req.query;
  const sortBy = typeof query.sortBy === 'string' ? query.sortBy : 'name';
  const direction =
    typeof query.sortDirection === 'string' ? query.sortDirection : 'asc';

  const data = await getHomepageData(
    res.locals.currentUser!.id,
    req.params.folderId || null,
    sortBy,
    direction,
  );

  res.render('index', {
    ...data,
    errors: null,
    oldInput: null,
    sortBy,
    direction,
  });
});

export const handleUploadFiles = asyncHandler(async (req, res) => {
  // Get user and folder info
  const userId = res.locals.currentUser!.id;
  const folderId = req.params.folderId || null;

  // Verify folder ownership if specified
  if (folderId) {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId, userId },
    });

    if (!folder) {
      throw new CustomNotFoundError('Folder not found');
    }
  }

  // Ensure files exist
  if (!req.files) {
    throw new CustomBadRequestError('No files provided');
  }

  // Normalize req.files to an array (it can be File[] or { [fieldname: string]: File[] })
  const filesArray = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files).flat();

  if (!filesArray || filesArray.length === 0) {
    throw new CustomBadRequestError('No files provided');
  }

  // Validate file types
  const invalidTypes = filesArray
    .filter(
      (file) =>
        !ALLOWED_FILE_TYPES.some((type) => file.mimetype.startsWith(type)),
    )
    .map((file) => path.extname(file.originalname));

  if (invalidTypes.length > 0) {
    throw new CustomBadRequestError(
      'Invalid file type. Allowed formats: images, videos, PDFs, Word documents, and Excel spreadsheets.',
    );
  }

  // Process each file
  const uploadedFiles = [];

  for (const file of filesArray) {
    const fileName =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      '-' +
      file.originalname;

    // SUPABASE STORAGE
    const supabasePath = `uploads/${userId}/${folderId ? `folder-${folderId}` : 'root'}/${fileName}`;

    const { error } = await supabase.storage
      .from('files')
      .upload(supabasePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throwSupabaseError(error, 'upload file');
    }

    // Extract metadata based on file type
    let width = null;
    let height = null;
    let duration = null;
    let thumbnailPath = null;

    if (file.mimetype.startsWith('image/')) {
      // Images: Just extract metadata, no thumbnail needed
      const metadata = await sharp(file.buffer).metadata();
      width = metadata.width || null;
      height = metadata.height || null;
    } else if (file.mimetype.startsWith('video/')) {
      // Videos: Extract metadata AND generate thumbnail
      const metadata = await getVideoMetadata(file.buffer);
      const videoStream = metadata.streams.find(
        (s: any) => s.codec_type === 'video',
      );

      width = videoStream?.width || null;
      height = videoStream?.height || null;
      duration = metadata.format.duration
        ? Math.floor(metadata.format.duration)
        : null;

      // Generate thumbnail
      const thumbnailBuffer = await generateVideoThumbnail(file.buffer, {
        width: 480,
        height: Math.floor(
          width && height ? 480 / (width / height) : 480 / (4 / 3),
        ),
      });
      const thumbnailFileName = fileName.replace(/\.[^.]+$/, '-thumb.jpg');
      thumbnailPath = `uploads/${userId}/${folderId || 'root'}/${thumbnailFileName}`;

      await supabase.storage
        .from('files')
        .upload(thumbnailPath, thumbnailBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });
    }

    // Save file metadata to database
    const savedFile = await prisma.file.create({
      data: {
        originalName: file.originalname,
        fileName,
        filePath: supabasePath,
        thumbnailPath,
        fileSize: file.size,
        mimeType: file.mimetype,
        width,
        height,
        duration,
        userId,
        folderId,
      },
    });

    uploadedFiles.push(savedFile);
  }

  // Send success response AFTER all files processed
  res.json({
    success: true,
    message: `${uploadedFiles.length} file(s) uploaded successfully.`,
    files: uploadedFiles,
  });
});

export const handleDownLoad = asyncHandler(async (req, res) => {
  const fileId = req.params.fileId;
  const userId = res.locals.currentUser!.id;

  // Get file from database
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId },
  });

  if (!file) {
    throw new CustomNotFoundError('File not found');
  }

  // supabase storage
  const { data, error } = await supabase.storage
    .from('files')
    .download(file.filePath);

  if (error) {
    throwSupabaseError(error, 'download file');
  }

  // Convert blob to buffer and send
  const buffer = Buffer.from(await data.arrayBuffer());

  /**
   * WHAT IT DOES HERE?
   * - Tells browser what type of file it is (image/jpeg, application/pdf, etc.)
   * - Browser uses this to handle the file correctly
   * - 'attachment': tells browser to download the file instead of displaying it
   * - 'filename="${file.originalName}": sets the download file's name
   *
   * WHY IT MATTERS?
   * - Window uses it to suggest the right program to open the file
   * - Browser knows if it's safe to download
   * - Prevents browser form trying to display binary files as text
   *
   */

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${file.originalName}"`,
  );
  res.setHeader('Content-Type', file.mimeType);
  res.send(buffer);
});

export const handleThumbnail = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  const file = await prisma.file.findFirst({
    where: { id: fileId, userId: res.locals.currentUser!.id },
  });

  if (!file) {
    throw new CustomNotFoundError('File not found');
  }

  // Images: Use Supabase transformation (fast, on-the-fly)
  if (file.mimeType.startsWith('image/')) {
    const { data, error } = await supabase.storage
      .from('files')
      .createSignedUrl(file.filePath, 3600, {
        transform: {
          width: 480,
          height: Math.floor((480 / file.width!) * file.height!),
          resize: 'cover',
        },
      });

    if (error) {
      throw new CustomInternalError('Failed to generate thumbnail');
    }

    return res.redirect(data.signedUrl);
  }

  // Videos: Use pre-generated thumbnail (fast, from storage)
  if (file.mimeType.startsWith('video/') && file.thumbnailPath) {
    const { data, error } = await supabase.storage
      .from('files')
      .createSignedUrl(file.thumbnailPath, 3600);

    if (error) {
      throw new CustomInternalError('Failed to fetch thumbnail for the video');
    }

    return res.redirect(data.signedUrl);
  }

  // Fallback: No thumbnail available
  res.status(404).send('Thumbnail not available');
});

export const handleDeleteFileById = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId = res.locals.currentUser!.id;

  const file = await prisma.file.findFirst({
    where: { id: fileId, userId },
  });

  if (!file) {
    throw new CustomNotFoundError('File not found');
  }

  // Collect all files to delete, in case there exists a thumbnail of the file
  const filesToDelete = [file.filePath];
  if (file.thumbnailPath) {
    filesToDelete.push(file.thumbnailPath);
  }

  // Delete from Supabase storage first
  const { error: storageError } = await supabase.storage
    .from('files')
    .remove(filesToDelete);

  if (storageError) {
    console.error('Storage deletion failed:', storageError);
    throw new CustomInternalError('Failed to delete the file from the storage');
  }

  // Only delete from database if storage deletion succeeded
  await prisma.file.delete({
    where: { id: fileId },
  });

  res.json({
    success: true,
    message: 'File has been deleted successfully',
    file,
  });
});
