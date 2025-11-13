import { Router } from 'express';
import { viewSharedFile } from '../controllers/file-sharing.controllers.js';
import { downloadSharedFile } from '../controllers/share.controller.js';

const router = Router();

// No authentication required
router.get('/:token', viewSharedFile);
router.get('/:token/download', downloadSharedFile);

export default router;
