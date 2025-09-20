import { Router } from 'express';

import { signInSchema, signUpSchema } from '../validators/user.js';
import { isAuthenticated, isNotAuthenticated } from '../auth/index.js';
import {
  getLandingPage,
  signInUser,
  signOutUser,
  signUpNewUser,
  upgradeUser,
} from '../controllers/auth.js';

const router = Router();

router.post('/sign-up', isNotAuthenticated, signUpSchema, signUpNewUser);

router.post('/sign-in', isNotAuthenticated, signInSchema, signInUser);

router.post('/upgrade', isAuthenticated, upgradeUser);

router.post('/sign-out', isAuthenticated, signOutUser);

router.get('/landing-page', isNotAuthenticated, getLandingPage);

export default router;
