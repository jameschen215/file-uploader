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

const upload = configureMulter('files', MAX_FILE_SIZE, MAX_FILES);

export const getHomepage: RequestHandler = (req, res) => {
  const items = [
    { category: 'folder', name: 'Books' },
    { category: 'folder', name: 'Code' },
    { category: 'folder', name: 'Music' },
    { category: 'folder', name: 'Video' },
    { category: 'folder', name: 'Tool' },
    { category: 'folder', name: 'Map' },
    { category: 'image', name: 'Flowers' },
    { category: 'video', name: 'Highlight' },
    { category: 'file', name: 'Notes' },
  ];

  res.render('index', { items });
};

export const getUploadForm: RequestHandler = (req, res) => {
  res.render('upload-form');
};

export const handleFileUpload: RequestHandler = (req, res) => {
  upload(req, res, (error) => {
    if (error instanceof MulterError) {
      console.log('Error code: ', error.code, error.message);

      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          return res.status(400).json({
            message: `Too large files! Maximum is ${MAX_FILE_SIZE}MB`,
          });

        case 'LIMIT_FIELD_COUNT':
          return res
            .status(400)
            .json({ message: `Too many files! Maximum is ${MAX_FILES}.` });

        default:
          return res.status(400).json({ message: error.message });
      }
    } else if (error) {
      return res.status(500).send('Unknown error');
    }

    // Validate file types HERE
    if (req.files && Array.isArray(req.files)) {
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
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      req.files.forEach((file) => {
        const filename =
          Date.now() +
          '-' +
          Math.round(Math.random() * 1e9) +
          '-' +
          file.originalname;

        fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
      });

      res.send(`${req.files.length} file(s) uploaded successfully!`);
    } else {
      res.status(400).send('No file uploaded or file buffer missing.');
    }
  });
};
