import { Router } from 'express';
import { isAuthenticated, requireRole } from '../auth/middlewares.js';
import {
  editOwnProfile,
  getAllUsers,
  getOwnProfile,
  getUserProfile,
} from '../controllers/user.controller.js';

const router = Router();

// Current user views their own profile
router.get('/profile', isAuthenticated, getOwnProfile);
router.put('/edit-profile', isAuthenticated, editOwnProfile);
router.put('/edit-password', isAuthenticated, editOwnPassword);

// Admin-only routes
router.get('/', isAuthenticated, requireRole(['admin']), getAllUsers);
router.get('/:userId', isAuthenticated, requireRole(['admin']), getUserProfile);

export default router;
