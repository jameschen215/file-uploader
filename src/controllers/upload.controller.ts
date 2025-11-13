import path from 'path';
import sharp from 'sharp';

import prisma from '../lib/prisma.js';
import { asyncHandler } from '../lib/async-handler.js';
import { ALLOWED_FILE_TYPES } from '../lib/constants.js';
import { configureSupabase } from '../config/supabase.js';
import { throwSupabaseError } from '../lib/supabase-helpers.js';
import { generateVideoThumbnail, getVideoMetadata } from '../lib/utils.js';
import { CustomBadRequestError, CustomNotFoundError } from '../errors/index.js';

const supabase = configureSupabase();

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
