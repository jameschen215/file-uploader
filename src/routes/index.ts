import { Router } from 'express';

import { isAuthenticated } from '../auth/index.js';
import {
  getFolderContent,
  getFolderForm,
  getUploadForm,
  handleFileUpload,
  handleFolderCreate,
} from '../controllers/index.js';
import { folderSchema } from '../validators/folder.js';

const router = Router();

router.get('/', isAuthenticated, getFolderContent);

router.get('/upload', isAuthenticated, getUploadForm);

router.get('/new-folder', isAuthenticated, getFolderForm);

router.get('/:folderId', isAuthenticated, getFolderContent);

router.post('/upload/', isAuthenticated, handleFileUpload);

router.post('/upload/:folderId', isAuthenticated, handleFileUpload);

router.post('/folders', isAuthenticated, folderSchema, handleFolderCreate);

export default router;
