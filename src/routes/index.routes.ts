// index.routes.ts

import { Router } from 'express';
import fileRoutes from './file.routes.js';
import folderRoutes from './folder.routes.js';
import uploadRoutes from './upload.routes.js';
import shareRoutes from './share.routes.js';

import { isAuthenticated } from '../auth/index.js';
import { handleGetFiles } from '../controllers/index.controller.js';

const router = Router();

// Homepage and file browser
router.get('/', isAuthenticated, handleGetFiles);

// Mount sub-routers
router.use('/files', fileRoutes); // /files/:fileId, /files/:fileId/download
router.use('/folders', folderRoutes); // /folders, /folders/:folderId
router.use('/upload', uploadRoutes); // /upload, /upload/:folderId

// Authenticated share creation
router.use('/files', shareRoutes); // POST /files/:type/:id/share
router.use('/folders', shareRoutes); // POST /folders/:type/:id/share

// Public share access
router.use('/share', shareRoutes); // /share/:token (public)

export default router;
