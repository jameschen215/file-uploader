import fs from 'fs';
import path from 'path';
import { MulterError } from 'multer';
import { RequestHandler } from 'express';

import { configureMulter } from '../config/multer.js';
import {
  ALLOWED_FILE_TYPES,
  MAX_FILES,
  MAX_FILE_SIZE,
} from '../lib/constants.js';
import prisma from '../lib/prisma.js';

import { getHomepageData } from '../lib/index-data.js';
import { configureSupabase } from '../config/supabase.js';

const supabase = configureSupabase();
const upload = configureMulter('files', MAX_FILE_SIZE, MAX_FILES);
const isDev = process.env.NODE_ENV === 'development';

export const getFiles: RequestHandler = async (req, res) => {
  const query = req.query;
  const sortBy = typeof query.sortBy === 'string' ? query.sortBy : 'name';
  const direction =
    typeof query.sortDirection === 'string' ? query.sortDirection : 'asc';

  console.log({ sortBy, direction });

  try {
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
  } catch (error) {
    console.error('Get folder contents error: ', error);
    throw error;
  }
};

export const getFileById: RequestHandler = async (req, res) => {
  const userId = res.locals.currentUser!.id;
  const { fileId } = req.params;

  console.log({ fileId });

  const file = await prisma.file.findFirst({
    where: { id: fileId, userId },
  });

  res.render('file', { file });
};

export const uploadFiles: RequestHandler = async (req, res) => {
  upload(req, res, async (error) => {
    // 1. handle Multer error
    if (error instanceof MulterError) {
      console.log('Error code: ', error.code, error.message);

      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          return res.status(400).json({
            error: `File too large! Maximum is ${MAX_FILE_SIZE}MB per file.`,
          });

        case 'LIMIT_FIELD_COUNT':
          return res
            .status(400)
            .json({ error: `Too many files! Maximum is ${MAX_FILES}.` });

        default:
          return res.status(400).json({ error: error.message });
      }
    } else if (error) {
      return res.status(500).json({ error: 'Unknown error' });
    }

    // 2. Check if files exist
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    // 3. Validate file types
    const invalidTypes = req.files
      .filter(
        (file) =>
          !ALLOWED_FILE_TYPES.some((type) => file.mimetype.startsWith(type)),
      )
      .map((file) => path.extname(file.originalname));

    if (invalidTypes.length > 0) {
      return res.status(400).json({
        message:
          'Invalid file type. Allowed formats: images, videos, PDFs, Word documents, and Excel spreadsheets.',
      });
    }

    // 4. Get user and folder info
    const userId = res.locals.currentUser!.id;
    const folderId = req.params.folderId || null;

    // 5. Verify folder ownership if specified
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId },
      });

      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' });
      }
    }

    try {
      const uploadedFiles = [];

      // 6. Process each file
      for (const file of req.files) {
        const fileName =
          Date.now() +
          '-' +
          Math.round(Math.random() * 1e9) +
          '-' +
          file.originalname;

        let filePath = '';
        let publicUrl = '';

        if (isDev) {
          // LOCAL STORAGE FOR DEVELOPMENT
          const folderPath = folderId
            ? path.join(
                process.cwd(),
                'uploads',
                `user-${userId}`,
                `folder-${folderId}`,
              )
            : path.join(process.cwd(), 'uploads', `user-${userId}`, 'root');

          // Create directory if it doesn't exist
          if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
          }

          filePath = path.join(folderPath, fileName);
          fs.writeFileSync(filePath, file.buffer);

          // For local, use relative path as "public URL"
          publicUrl = `uploads/user-${userId}/${folderId ? `folder-${folderId}` : 'root'}/${fileName}`;
        } else {
          // SUPABASE STORAGE FOR PRODUCTION
          const supabasePath = `uploads/${userId}/${folderId ? `folder-${folderId}` : 'root'}/${fileName}`;

          const { data, error } = await supabase.storage
            .from('files')
            .upload(supabasePath, file.buffer, {
              contentType: file.mimetype,
              upsert: false,
            });

          if (error) {
            console.error('Supabase upload error: ', error);
            return res.status(500).json({ error: 'Failed to upload file' });
          }

          const { data: publicUrlData } = supabase.storage
            .from('files')
            .getPublicUrl(supabasePath);

          filePath = supabasePath;
          publicUrl = publicUrlData.publicUrl;
        }

        // 7. Save file metadata to database
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

      // 8. Send success response and redirect AFTER all files processed
      res.json({
        success: true,
        message: `${uploadedFiles.length} file(s) uploaded successfully.`,
        files: uploadedFiles,
      });

      // No redirect here, (Better to let frontend handle redirect)
    } catch (error) {
      console.error('Upload error: ', error);
      res.status(500).json({ error: 'Failed to save files' });
    }
  });
};
