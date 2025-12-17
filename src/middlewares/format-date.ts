import { RequestHandler } from 'express';
import { format, formatDistanceToNow } from 'date-fns';

export const formatDate: RequestHandler = (_req, res, next) => {
  res.locals.formatDate = format;
  res.locals.formatDateToNow = formatDistanceToNow;

  next();
};
