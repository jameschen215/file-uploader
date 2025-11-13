import { Router } from 'express';
import { isAuthenticated } from '../auth/middlewares.js';
import {
  createShareLink,
  listFileShares,
  revokeShareLink,
} from '../controllers/share.controller.js';

const router = Router();

router.use(isAuthenticated);

// Share management
router.post('/:fileId/share', createShareLink);
router.get('/:fileId/shares', listFileShares);
router.delete('/:fileId/shares/:shareId', revokeShareLink);

export default router;
