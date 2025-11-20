import { Router } from 'express';
import { isAuthenticated } from '../auth/middlewares.js';
import {
  handleDesktopSearch,
  handleMobileSearch,
} from '../controllers/search.controller.js';

const router = Router();

router.use(isAuthenticated);

router.get('/', handleMobileSearch);
router.get('/desktop', handleDesktopSearch);

export default router;
