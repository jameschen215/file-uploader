import { Router } from 'express';
import { isAuthenticated } from '../auth/middlewares.js';
import { getUserProfile } from '../controllers/user.controller.js';

const router = Router();

router.get('/:userId', isAuthenticated, getUserProfile);

export default router;
