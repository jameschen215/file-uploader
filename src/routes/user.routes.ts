import { Router } from 'express';
import { isAuthenticated, requireRole } from '../auth/middlewares.js';
import {
  getAllUsers,
  getOwnProfile,
  getUserProfile,
} from '../controllers/user.controller.js';

const router = Router();

// Current user views their own profile
router.get('/profile', isAuthenticated, getOwnProfile);

// Admin-only routes
router.get('/', isAuthenticated, requireRole(['admin']), getAllUsers);
router.get('/:userId', isAuthenticated, requireRole(['admin']), getUserProfile);

export default router;
