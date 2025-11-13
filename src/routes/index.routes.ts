// index.routes.ts

import { Router } from 'express';
import fileRoutes from './file.routes.js';
import folderRoutes from './folder.routes.js';
import uploadRoutes from './upload.routes.js';
import shareRoutes from './share.routes.js';
import publicShareRoutes from './public-share.routes.js';

import { isAuthenticated } from '../auth/index.js';
import { handleGetFiles } from '../controllers/index.controller.js';

const router = Router();

// Homepage and file browser
router.get('/', isAuthenticated, handleGetFiles);

// Mount sub-routers
router.use('/files', fileRoutes); // /files/:fileId, /files/:fileId/download
router.use('/folders', folderRoutes); // /folders, /folders/:folderId
router.use('/upload', uploadRoutes); // /upload, /upload/:folderId
router.use('/files', shareRoutes); // /files/:fileId/share
router.use('/share', publicShareRoutes); // /share/:token (public)

export default router;
