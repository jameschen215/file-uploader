import { Router } from 'express';
import { isAuthenticated } from '../auth/middlewares.js';
import {
  createShareLink,
  downloadFileFromSharedFolder,
  downloadSharedFile,
  viewSharedFile,
  viewSharedFolder,
} from '../controllers/share.controller.js';

const router = Router();

// Single route to get/create share link (authenticated)
router.post('/:type/:id/share', isAuthenticated, createShareLink);

// Public routes to access shared content - no auth
router.get('/file/:token', viewSharedFile);
router.get('/file/:token/download', downloadSharedFile);
router.get('/folder/:token', viewSharedFolder);
router.get(
  '/folder/:token/file/:fileId/download',
  downloadFileFromSharedFolder,
);

export default router;
