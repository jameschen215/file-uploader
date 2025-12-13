// folder.routes.ts

import { Router } from 'express';

import {
  handleCreateFolder,
  handleDeleteFolder,
  handleGetFolderContent,
  handleRenameFolder,
} from '../controllers/folder.controller.js';
import { folderSchema } from '../validators/folder.js';
import { isAuthenticated } from '../auth/middlewares.js';
import { configureMulter } from '../config/multer.config.js';
import { MAX_FILE_SIZE, MAX_FILES } from '../lib/constants.js';
import { checkStorageLimit } from '../middlewares/check-storage-limit.js';
import { handleUploadFiles } from '../controllers/upload.controller.js';

const router = Router();
const upload = configureMulter('files', MAX_FILE_SIZE, MAX_FILES);

router.use(isAuthenticated);

router.get('/:folderId', handleGetFolderContent);

router.post('/', folderSchema, handleCreateFolder);

router.put('/:folderId', folderSchema, handleRenameFolder);

router.delete('/:folderId', handleDeleteFolder);

// File uploads
router.post('/:folderId/files', upload, checkStorageLimit, handleUploadFiles);

export default router;
