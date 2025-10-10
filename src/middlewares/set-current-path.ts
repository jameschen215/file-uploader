import { RequestHandler } from 'express';

export const setCurrentPath: RequestHandler = (req, res, next) => {
  res.locals.currentPath = req.path;

  next();
};
