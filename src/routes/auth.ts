import { Router, urlencoded } from 'express';

import { signInSchema, signUpSchema } from '../validators/user.js';
import { isAuthenticated, isNotAuthenticated } from '../auth/index.js';
import {
  getLandingPage,
  getSignIpPage,
  getSignUpPage,
  signInUser,
  signOutUser,
  signUpNewUser,
  upgradeUser,
} from '../controllers/auth.js';

const router = Router();

router.post(
  '/sign-up',
  isNotAuthenticated,
  urlencoded({ extended: true }),
  signUpSchema,
  signUpNewUser,
);

router.post(
  '/sign-in',
  isNotAuthenticated,
  urlencoded({ extended: true }),
  signInSchema,
  signInUser,
);

router.post(
  '/upgrade',
  isAuthenticated,
  urlencoded({ extended: true }),
  upgradeUser,
);

router.post('/sign-out', isAuthenticated, signOutUser);

router.get('/landing-page', isNotAuthenticated, getLandingPage);

router.get('/sign-up', isNotAuthenticated, getSignUpPage);

router.get('/sign-in', isNotAuthenticated, getSignIpPage);

export default router;
