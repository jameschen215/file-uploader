import { Router } from 'express';

import { isAuthenticated } from '../auth/index.js';
import { getFiles, uploadFiles } from '../controllers/index.js';

const router = Router();

router.get('/', isAuthenticated, getFiles);

router.post('/upload/', isAuthenticated, uploadFiles);

router.post('/upload/:folderId', isAuthenticated, uploadFiles);

export default router;
