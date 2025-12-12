// file.routes.ts

import { Router } from 'express';

import {
  handleDeleteFile,
  handleDownloadFile,
  handleGetFile,
  handleGetFilePreview,
  handleGetThumbnail,
} from '../controllers/file.controller.js';
import { isAuthenticated } from '../auth/middlewares.js';

const router = Router();

// All routes require authentication
router.use(isAuthenticated);

// File operations
router.get('/:fileId', handleGetFile);
router.get('/:fileId/download', handleDownloadFile);
router.get('/:fileId/thumbnail', handleGetThumbnail);

// file preview
router.get('/:fileId/preview', handleGetFilePreview);

router.delete('/:fileId', handleDeleteFile);

export default router;
