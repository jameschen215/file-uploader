// folder.routes.ts

import multer from 'multer';
import { Router } from 'express';

import {
  handleCreateFolder,
  handleDeleteFolder,
  handleGetFolderContent,
  handleRenameFolder,
} from '../controllers/folder.controller.js';
import { folderSchema } from '../validators/folder.js';
import { isAuthenticated } from '../auth/middlewares.js';

const router = Router();
const upload = multer();

router.use(isAuthenticated);

router.post('/', upload.none(), folderSchema, handleCreateFolder);
router.get('/:folderId', handleGetFolderContent);
router.delete('/:folderId', handleDeleteFolder);
router.put('/:folderId', upload.none(), folderSchema, handleRenameFolder);

export default router;
