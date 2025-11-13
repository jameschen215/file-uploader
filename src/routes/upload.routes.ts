import { Router } from 'express';

import { isAuthenticated } from '../auth/middlewares.js';
import { configureMulter } from '../config/multer.js';
import { MAX_FILE_SIZE, MAX_FILES } from '../lib/constants.js';
import { handleUploadFiles } from '../controllers/upload.controller.js';

const router = Router();
const upload = configureMulter('files', MAX_FILE_SIZE, MAX_FILES);

router.use(isAuthenticated);

// Upload to root
router.post('/', upload, handleUploadFiles);

// Upload to specific folder
router.post('/:folderId', upload, handleUploadFiles);

export default router;
