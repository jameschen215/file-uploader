import { Router } from 'express';

import { isAuthenticated } from '../auth/index.js';
import {
  getFiles,
  uploadFiles,
  createFolder,
  handleSearch,
  handleDesktopSearch,
} from '../controllers/index.js';
import { folderSchema } from '../validators/folder.js';
import multer from 'multer';

const upload = multer();

const router = Router();

router.get('/', isAuthenticated, getFiles);

router.get('/folders/:folderId', isAuthenticated, getFiles);

router.get('/desktop/search', isAuthenticated, handleDesktopSearch);

router.get('/search', isAuthenticated, handleSearch);

router.post('/upload/', isAuthenticated, uploadFiles);

router.post('/upload/:folderId', isAuthenticated, uploadFiles);

router.post(
  '/folders',
  isAuthenticated,
  upload.none(),
  folderSchema,
  createFolder,
);

export default router;
