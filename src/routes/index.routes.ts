// index.routes.ts

import { Router } from 'express';
import fileRoutes from './file.routes.js';
import folderRoutes from './folder.routes.js';
import uploadRoutes from './upload.routes.js';
import shareRoutes from './share.routes.js';
import searchRoutes from './search.routes.js';

import { isAuthenticated } from '../auth/index.js';
import { handleGetFolderContent } from '../controllers/index.controller.js';

const router = Router();

// Homepage and file browser
router.get('/', isAuthenticated, handleGetFolderContent);

// Mount sub-routers
router.use('/files', fileRoutes); // /files/:fileId, /files/:fileId/download
router.use('/folders', folderRoutes); // /folders, /folders/:folderId
router.use('/upload', uploadRoutes); // /upload, /upload/:folderId

router.use('/search', searchRoutes); // /search/, /search/desktop

// Authenticated share creation
router.use('/files', shareRoutes); // POST /files/:type/:id/share
router.use('/folders', shareRoutes); // POST /folders/:type/:id/share

// Public share access
router.use('/share', shareRoutes); // /share/:token (public)

// Toast test
router.get('/toast', (_req, res) => {
  res.render('toast-test');
});

export default router;
