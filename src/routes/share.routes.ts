import { Router } from 'express';
import { isAuthenticated } from '../auth/middlewares.js';
import {
  createFileShare,
  createFolderShare,
  downloadFileFromSharedFolder,
  downloadSharedFile,
  previewFileFromSharedFolder,
  previewSharedFile,
  viewFileFromSharedFolder,
  viewSharedFile,
  viewSharedFolder,
} from '../controllers/share.controller.js';

const router = Router();

// Single route to get/create share link (authenticated)
router.post('/files/:fileId', isAuthenticated, createFileShare);
router.post('/folders/:folderId', isAuthenticated, createFolderShare);

// Public file access
router.get('/file/:fileToken', viewSharedFile); // Get file
router.get('/file/:fileToken/preview', previewSharedFile); // Get image
router.get('/file/:fileToken/download', downloadSharedFile);

// Public folder access
router.get('/folder/:folderToken', viewSharedFolder);
router.get('/folder/:folderToken/file/:fileId', viewFileFromSharedFolder); // Get file
router.get(
  '/folder/:folderToken/file/:fileId/preview',
  previewFileFromSharedFolder,
); // Get image
router.get(
  '/folder/:folderToken/file/:fileId/download',
  downloadFileFromSharedFolder,
);

// Public file preview

export default router;
