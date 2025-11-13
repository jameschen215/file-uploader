import { Router } from 'express';
import {
  createShareLink,
  downloadSharedFile,
  listFileShares,
  revokeShareLink,
  viewSharedFile,
} from '../controllers/file-sharing.controllers.js';

const router = Router();

router.post('/files/:fileId/share', createShareLink);

router.get('/files/:fileId/shares', listFileShares);

router.delete('/files/:fileId/shares/:shareId', revokeShareLink);

// Public routes (no auth required)
router.get('/share/:token', viewSharedFile);

router.get('/share/:token/download', downloadSharedFile);

export default router;
