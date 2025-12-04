import { Router } from 'express';

import { signInSchema, signUpSchema } from '../validators/user.js';
import { isAuthenticated, isNotAuthenticated } from '../auth/index.js';
import {
  getLandingPage,
  getSignIpPage,
  getSignUpPage,
  signInUser,
  signOutUser,
  signUpNewUser,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/sign-up', isNotAuthenticated, signUpSchema, signUpNewUser);

router.post('/sign-in', isNotAuthenticated, signInSchema, signInUser);

router.post('/sign-out', isAuthenticated, signOutUser);

router.get('/landing-page', isNotAuthenticated, getLandingPage);

router.get('/sign-up', isNotAuthenticated, getSignUpPage);

router.get('/sign-in', isNotAuthenticated, getSignIpPage);

export default router;
