import { Router } from 'express';
import { isAuthenticated, requireRole } from '../auth/middlewares.js';
import {
  updateOwnPassword,
  editOwnProfile,
  getAllUsers,
  getOwnProfile,
  getUserProfile,
  getUpdatePasswordPage,
} from '../controllers/user.controller.js';
import { renameSchema, updatePasswordSchema } from '../validators/user.js';

const router = Router();

// Current user views their own profile
router.get('/profile', isAuthenticated, getOwnProfile);
router.put('/edit-profile', isAuthenticated, renameSchema, editOwnProfile);

router.get('/update-password', isAuthenticated, getUpdatePasswordPage);
router.put(
  '/update-password',
  isAuthenticated,
  updatePasswordSchema,
  updateOwnPassword,
);

// Admin-only routes
router.get('/', isAuthenticated, requireRole(['admin']), getAllUsers);
router.get('/:userId', isAuthenticated, requireRole(['admin']), getUserProfile);

export default router;
