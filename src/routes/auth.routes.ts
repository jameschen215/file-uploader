import { Router } from 'express';

import { signInSchema, signUpSchema } from '../validators/user.js';
import { isAuthenticated, isNotAuthenticated } from '../auth/index.js';
import {
  getSignIpPage,
  getSignUpPage,
  signInUser,
  signOutUser,
  signUpNewUser,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/sign-up', isNotAuthenticated, signUpSchema, signUpNewUser);
router.get('/sign-up', isNotAuthenticated, getSignUpPage);

router.post('/sign-in', isNotAuthenticated, signInSchema, signInUser);
router.get('/sign-in', isNotAuthenticated, getSignIpPage);

router.post('/sign-out', isAuthenticated, signOutUser);

export default router;
