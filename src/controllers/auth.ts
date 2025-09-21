import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';

import { SALT_ROUND } from '../lib/constants.js';
import prisma from '../lib/prisma.js';
import { CreateUserType, PublicUserType } from '../types/user.js';
import passport from 'passport';
import { validationResult } from 'express-validator';

export const signUpNewUser: RequestHandler = async (req, res, next) => {
  // THIS IS CRUCIAL - check for validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(400)
      .render('sign-up', { errors: errors.mapped(), oldInput: req.body });
  }

  const { name, email, password }: CreateUserType = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

    await prisma.user.create({
      data: { name: name || null, email, password: hashedPassword },
    });

    res.status(201).redirect('/auth/sign-in');
  } catch (error) {
    next(error);
  }
};

export const signInUser: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.mapped(),
    });
  }

  passport.authenticate(
    'local',
    (error: Error, user: PublicUserType, info: { message?: string }) => {
      if (error) return next(error);

      // login failed
      if (!user) {
        return res
          .status(401)
          .json({ message: info.message || 'Invalid email or password' });
      }

      // login user manually
      req.logIn(user, (error) => {
        if (error) {
          return res
            .status(500)
            .json({ message: 'Login failed. Please try again' });
        }

        res.json({ message: 'You are signed in successfully' });
      });
    },
  )(req, res, next);
};

export const upgradeUser: RequestHandler = async (req, res, next) => {};

export const signOutUser: RequestHandler = async (req, res, next) => {
  req.logOut((error) => {
    if (error) return next(error);

    res.json({ message: 'You are signed out' });
  });
};

export const getLandingPage: RequestHandler = (req, res) => {
  res.render('landing-page');
};

// sign up page
export const getSignUpPage: RequestHandler = (req, res) => {
  res.render('sign-up', { oldInput: null, errors: null });
};

// sign up page
export const getSignIpPage: RequestHandler = (req, res) => {
  res.render('sign-in', { oldInput: null, errors: null });
};
