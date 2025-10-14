import fs from 'fs';
import path from 'path';
import { MulterError } from 'multer';
import { RequestHandler, Request, Response } from 'express';

import { configureMulter } from '../config/multer.js';
import {
  ALLOWED_FILE_TYPES,
  MAX_FILES,
  MAX_FILE_SIZE,
} from '../lib/constants.js';
import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { CustomNotFoundError } from '../errors/index.js';
import { validationResult } from 'express-validator';
import { getHomepageData } from '../lib/index-data.js';

const upload = configureMulter('files', MAX_FILE_SIZE, MAX_FILES);
const isDev = process.env.NODE_ENV === 'development';

// Get saved files
export const getFolderContent: RequestHandler = async (req, res) => {
  try {
    const data = await getHomepageData(
      res.locals.currentUser!.id,
      req.params.folderId || null,
    );

    console.log('Breadcrumbs: ', data.breadcrumbs);

    res.render('index', {
      ...data,
      errors: null,
      oldInput: null,
    });
  } catch (error) {
    console.error('Get folder contents error: ', error);
    throw error;
  }
};

export const getUploadForm: RequestHandler = (req, res) => {
  res.render('upload-form');
};

export const getFolderForm: RequestHandler = (req, res) => {
  res.render('folder-form', { errors: null, oldInput: null });
};

// --- --- --- --- --- Handle file upload --- --- --- --- ---  //

export const handleFileUpload: RequestHandler = async (req, res) => {
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
          console.log({ folderId });
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
          // TODO:
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

        // 8. Send success response and redirect AFTER all files processed
        res.json({
          success: true,
          message: `${uploadedFiles.length} file(s) uploaded successfully.`,
          files: uploadedFiles,
        });

        // Optional: Redirect after response is sent
        // (Better to let frontend handle redirect)
      }
    } catch (error) {
      console.error('Upload error: ', error);
      res.status(500).json({ error: 'Failed to save files' });
    }
  });
};

// --- Handle new folder creation ---
export const handleFolderCreate: RequestHandler = async (req, res) => {
  const userId = res.locals.currentUser!.id;
  const errors = validationResult(req);
  const data = await getHomepageData(userId, req.params.folderId);

  if (!errors.isEmpty()) {
    return res.status(400).render('index', {
      ...data,
      errors: errors.mapped(),
      oldInput: req.body,
    });
  }

  try {
    const { name, parentFolderId } = req.body;

    // Validate parent folder exists and belongs to user (if specified)
    if (parentFolderId) {
      const parentFolder = await prisma.folder.findFirst({
        where: { id: parentFolderId, userId },
      });

      if (!parentFolder) {
        throw new CustomNotFoundError('Parent folder not found');
      }
    }

    await prisma.folder.create({
      data: {
        name: name.trim(),
        userId,
        parentFolderId: parentFolderId || null,
      },
      include: {
        parentFolder: { select: { name: true } },
        _count: { select: { files: true, subFolders: true } },
      },
    });

    const redirectUrl = parentFolderId ? `/${parentFolderId}` : '/';
    res.redirect(redirectUrl);
  } catch (error) {
    // Check if it's a Prisma error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        return res
          .status(400)
          .json({ error: 'Folder name already exists in this location' });
      }
    }

    console.error('Create folder error: ', error);

    res.status(500).json({ error: 'Failed to create folder' });
  }
};
