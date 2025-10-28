import path from 'path';
import prisma from '../lib/prisma.js';

import { asyncHandler } from '../lib/async-handler.js';
import { getHomepageData } from '../lib/index-data.js';
import { ALLOWED_FILE_TYPES } from '../lib/constants.js';
import { configureSupabase } from '../config/supabase.js';
import { throwSupabaseError } from '../lib/supabase-helpers.js';
import { CustomBadRequestError, CustomNotFoundError } from '../errors/index.js';

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

export const handleGetFileById = asyncHandler(async (req, res) => {
  const userId = res.locals.currentUser!.id;
  const { fileId } = req.params;

  const file = await prisma.file.findUnique({
    where: { id: fileId, userId },
  });

  if (!file) {
    throw new CustomNotFoundError('File not found');
  }

  // Add thumbnail URL
  const { data } = supabase.storage.from('files').getPublicUrl(file.filePath, {
    transform: { width: 200, height: 200, resize: 'cover' },
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

    const { data: publicUrlData } = supabase.storage
      .from('files')
      .getPublicUrl(supabasePath);

    const filePath = supabasePath;
    const publicUrl = publicUrlData.publicUrl;

    // Save file metadata to database
    const savedFile = await prisma.file.create({
      data: {
        originalName: file.originalname,
        fileName,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        publicUrl,
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
