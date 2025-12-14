import { RequestHandler } from 'express';
import { formatByteSize } from '../lib/utils.js';

export const formatFileSize: RequestHandler = (_req, res, next) => {
  res.locals.formatFileSize = formatByteSize;

  next();
};
