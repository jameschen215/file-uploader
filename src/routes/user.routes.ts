import { Router } from 'express';
import { isAuthenticated, requireRole } from '../auth/middlewares.js';
import {
  updateOwnPassword,
  editOwnProfile,
  getAllUsers,
  getOwnProfile,
  getUserProfileById,
  deleteUser,
} from '../controllers/user.controller.js';
import { renameSchema, updatePasswordSchema } from '../validators/user.js';

const router = Router();

router.use(isAuthenticated);

// Current user views their own profile
router.get('/profile', getOwnProfile);
router.put('/edit-profile', renameSchema, editOwnProfile);

router.put('/update-password', updatePasswordSchema, updateOwnPassword);

// Admin only
router.get('/', requireRole(['ADMIN']), getAllUsers);
router.get('/:userId', requireRole(['ADMIN']), getUserProfileById);
router.delete('/:userId', requireRole(['ADMIN']), deleteUser);

export default router;
