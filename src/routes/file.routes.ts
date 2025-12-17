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
import { configureMulter } from '../config/multer.config.js';
import { MAX_FILE_SIZE, MAX_FILES } from '../lib/constants.js';
import { checkStorageLimit } from '../middlewares/check-storage-limit.js';
import { handleUploadFiles } from '../controllers/upload.controller.js';

const router = Router();
const upload = configureMulter('files', MAX_FILE_SIZE, MAX_FILES);

// All routes require authentication
router.use(isAuthenticated);

// File operations
router.get('/:fileId', handleGetFile);
router.get('/:fileId/download', handleDownloadFile);
router.get('/:fileId/thumbnail', handleGetThumbnail);
router.get('/:fileId/preview', handleGetFilePreview);

router.delete('/:fileId', handleDeleteFile);

// Upload to root - no folder
router.post('/', upload, checkStorageLimit, handleUploadFiles);

export default router;
