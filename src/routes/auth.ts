import { Router } from 'express';

import { isAuthenticated, isNotAuthenticated } from '../auth';
import {
	signInUser,
	signOutUser,
	signUpNewUser,
	upgradeUser,
} from '../controllers/auth';

const router = Router();

router.post('/sign-up', isNotAuthenticated, signUpNewUser);

router.post('/sign-in', isNotAuthenticated, signInUser);

router.post('/upgrade', isAuthenticated, upgradeUser);

router.post('/sign-out', isAuthenticated, signOutUser);

export default router;
