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

const router = Router();

router.use(isAuthenticated);

router.post('/', folderSchema, handleCreateFolder);
router.get('/:folderId', handleGetFolderContent);
router.delete('/:folderId', handleDeleteFolder);
router.put('/:folderId', folderSchema, handleRenameFolder);

export default router;
