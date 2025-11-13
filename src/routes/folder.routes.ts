// folder.routes.ts

import { Router } from 'express';
import { isAuthenticated } from '../auth/middlewares.js';
import {
  handleCreateFolder,
  handleDeleteFolder,
  handleGetFolderContent,
  handleRenameFolder,
} from '../controllers/folder.controller.js';

const router = Router();

router.use(isAuthenticated);

router.post('/', handleCreateFolder);
router.get('/:folderId', handleGetFolderContent);
router.delete('/:folderId', handleDeleteFolder);
router.put('/:folderId', handleRenameFolder);

export default router;
