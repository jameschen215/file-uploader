import { Router } from 'express';
import { getHomepage } from '../controllers/index.js';
import { isAuthenticated } from '../auth/index.js';

const router = Router();

router.get('/', isAuthenticated, getHomepage);

export default router;
