import { Router } from 'express';
import { isAuthenticated } from '../auth/middlewares.js';
import {
  handleDesktopSearch,
  handleMobileSearch,
} from '../controllers/search.js';

const router = Router();

router.get('/mobile', isAuthenticated, handleMobileSearch);
router.get('/desktop', isAuthenticated, handleDesktopSearch);

export default router;
