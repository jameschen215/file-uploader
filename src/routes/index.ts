// index.routes.ts

import { Router } from 'express';
import fileRoutes from './file.routes.js';
import folderRoutes from './folder.routes.js';
import uploadRoutes from './upload.routes.js';

import { isAuthenticated } from '../auth/index.js';
import { configureMulter } from '../config/multer.js';
import { MAX_FILE_SIZE, MAX_FILES } from '../lib/constants.js';

import {
  handleDeleteFileById,
  handleDownLoad,
  handleGetFiles,
  handleThumbnail,
  handleUploadFiles,
} from '../controllers/index.js';

const router = Router();

const upload = configureMulter('files', MAX_FILE_SIZE, MAX_FILES);

router.get('/files/:fileId/download', isAuthenticated, handleDownLoad);

router.get('/files/:fileId/thumbnail', isAuthenticated, handleThumbnail);

router.post('/upload/', isAuthenticated, upload, handleUploadFiles);

router.post('/upload/:folderId', isAuthenticated, upload, handleUploadFiles);

router.delete('/files/:fileId', isAuthenticated, handleDeleteFileById);

export default router;
