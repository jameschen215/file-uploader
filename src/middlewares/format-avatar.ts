import { RequestHandler } from 'express';
import { PublicUserType } from '../types/user.js';

export const formatAvatar: RequestHandler = (_req, res, next) => {
  res.locals.formatAvatar = (user: PublicUserType) => {
    if (!user) return 'N/A';

    return user?.name
      ? user.name.charAt(0).toUpperCase()
      : user.email.charAt(0).toUpperCase();
  };

  next();
};
