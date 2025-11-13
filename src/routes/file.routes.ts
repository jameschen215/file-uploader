// file.routes.ts

import { Router } from 'express';
import { isAuthenticated } from '../auth/middlewares.js';
import {
  handleDeleteFile,
  handleDownloadFile,
  handleGetFile,
  handleGetThumbnail,
} from '../controllers/file.controller.js';

const router = Router();

// All routes require authentication
router.use(isAuthenticated);

// File operations
router.get('/:fileId', handleGetFile);
router.get('/:fileId/download', handleDownloadFile);
router.get('/:fileId/thumbnail', handleGetThumbnail);
router.delete('/:fileId', handleDeleteFile);

export default router;
