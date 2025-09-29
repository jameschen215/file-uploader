import { Router } from 'express';

import { isAuthenticated } from '../auth/index.js';
import {
  getHomepage,
  getUploadForm,
  handleFileUpload,
} from '../controllers/index.js';

const router = Router();

router.get('/', isAuthenticated, getHomepage);

router.get('/upload', getUploadForm);

router.post('/upload', handleFileUpload);

export default router;
