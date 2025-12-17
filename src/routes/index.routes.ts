// index.routes.ts

import { Router } from 'express';

import {
  getLandingPage,
  getDashboard,
} from '../controllers/index.controller.js';

import fileRoutes from './file.routes.js';
import folderRoutes from './folder.routes.js';
import shareRoutes from './share.routes.js';
import searchRoutes from './search.routes.js';
import { isAuthenticated, isNotAuthenticated } from '../auth/index.js';

const router = Router();

// Public - Landing page
router.get('/', isNotAuthenticated, getLandingPage);

// Authenticated - main app view
router.get('/dashboard', isAuthenticated, getDashboard);

// Mount sub-routers
router.use('/files', fileRoutes); // /files/:fileId, /files/:fileId/download
router.use('/folders', folderRoutes); // /folders, /folders/:folderId
router.use('/search', searchRoutes); // /search/, /search/desktop
router.use('/shares', shareRoutes); // `/shares/files/...`, `/shares/folders/...`

export default router;
