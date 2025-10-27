import { RequestHandler } from 'express';
import { format } from 'date-fns';

export const getFileFormatter: RequestHandler = (_req, res, next) => {
  res.locals.formatDate = format;

  res.locals.formatSize = (fileSize: number) => {
    if (fileSize < 2 ** 20) {
      return Math.ceil(fileSize / 1024) + 'KB';
    }
    return (fileSize / 1024 / 1024).toFixed(1) + 'MB';
  };

  next();
};
