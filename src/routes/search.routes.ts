import { Router } from 'express';
import { isAuthenticated } from '../auth/middlewares.js';
import { handleMobileSearch } from '../controllers/search.controller.js';

const router = Router();

router.get('/', isAuthenticated, handleMobileSearch);

export default router;
