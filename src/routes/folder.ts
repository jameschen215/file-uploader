import multer from 'multer';
import { Router } from 'express';

import { folderSchema } from '../validators/folder.js';
import { isAuthenticated } from '../auth/middlewares.js';

import { getFiles } from '../controllers/index.js';
import { createFolder } from '../controllers/folder.js';

const router = Router();

const upload = multer();

router.get('/:folderId', isAuthenticated, getFiles);

router.post('/', isAuthenticated, upload.none(), folderSchema, createFolder);

export default router;
