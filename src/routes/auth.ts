import { Router } from 'express';

import { signInSchema, signUpSchema } from '../validators/user';
import { isAuthenticated, isNotAuthenticated } from '../auth';
import {
	signInUser,
	signOutUser,
	signUpNewUser,
	upgradeUser,
} from '../controllers/auth';

const router = Router();

router.post('/sign-up', isNotAuthenticated, signUpSchema, signUpNewUser);

router.post('/sign-in', isNotAuthenticated, signInSchema, signInUser);

router.post('/upgrade', isAuthenticated, upgradeUser);

router.post('/sign-out', isAuthenticated, signOutUser);

export default router;
