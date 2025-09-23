import { RequestHandler } from 'express';
import { UserType } from '../types/user.js';

export const setCurrentUser: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    const { password, ...publicUser } = req.user as UserType;

    res.locals.currentUser = publicUser;
  }

  next();
};
