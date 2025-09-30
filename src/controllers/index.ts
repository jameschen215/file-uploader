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
import { buildPath } from '../lib/build-path.js';
import { validationResult } from 'express-validator';

const upload = configureMulter('files', MAX_FILE_SIZE, MAX_FILES);
const isDev = process.env.NODE_ENV === 'development';

// export const getHomepage: RequestHandler = (req, res) => {
//   const items = [
//     { category: 'folder', name: 'Books' },
//     { category: 'folder', name: 'Code' },
//     { category: 'folder', name: 'Music' },
//     { category: 'folder', name: 'Video' },
//     { category: 'folder', name: 'Tool' },
//     { category: 'folder', name: 'Map' },
//     { category: 'image', name: 'Flowers' },
//     { category: 'video', name: 'Highlight' },
//     { category: 'file', name: 'Notes' },
//   ];

//   res.render('index', { items });
// };

// Get saved files
export const getFolderContent: RequestHandler = async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const userId = res.locals.currentUser!.id;

    // Verify folder access if specified
    let currentFolder = null;

    if (folderId) {
      currentFolder = await prisma.folder.findFirst({
        where: { id: folderId, userId },
        include: { parentFolder: { select: { id: true, name: true } } },
      });

      console.log({ folderId, currentFolder });

      if (!currentFolder) {
        throw new CustomNotFoundError('Folder not found');
      }
    }

    // Build breadcrumbs
    const breadcrumbs = await buildPath(userId, folderId);

    // Get subfolders in current folder
    const folders = await prisma.folder.findMany({
      where: { parentFolderId: folderId, userId },
      include: {
        _count: { select: { files: true, subFolders: true } },
      },
      orderBy: { name: 'asc' },
    });

    // Get files in current folder
    const files = await prisma.file.findMany({
      where: { folderId, userId },
      orderBy: { originalName: 'asc' },
    });

    res.render('index', {
      currentFolder,
      breadcrumbs,
      folders,
      files,
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
            error: `Too large files! Maximum is ${MAX_FILE_SIZE}MB`,
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

    if (req.files && Array.isArray(req.files)) {
      // Handle custom type limit error
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

      // All validations passed - process files
      const userId = res.locals.currentUser!.id;
      const folderId = req.params.folderId || null;

      // Verify folder ownership if specified
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
            // TODO:
          }

          // Save file to database
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

          res.json({ success: true, files: uploadedFiles });
        }
      } catch (error) {
        console.error('Upload error: ', error);
        res.status(500).json({ error: 'Failed to save files' });
      }
    } else {
      res
        .status(400)
        .json({ error: 'No file uploaded or file buffer missing.' });
    }
  });
};

// --- Handle new folder creation ---
export const handleFolderCreate: RequestHandler = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(400)
      .render('folder-form', { errors: errors.mapped(), oldInput: req.body });
  }

  try {
    const { name, parentFolderId } = req.body;
    const userId = res.locals.currentUser!.id;

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
