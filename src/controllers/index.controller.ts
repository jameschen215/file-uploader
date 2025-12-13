import { RequestHandler } from 'express';
import { asyncHandler } from '../lib/async-handler.js';
import { getFolderData } from '../lib/get-folder-data.js';

export const getLandingPage: RequestHandler = (_req, res) => {
  res.render('landing-page');
};

export const getDashboard = asyncHandler(async (req, res) => {
  const query = req.query;
  const sortBy = typeof query.sortBy === 'string' ? query.sortBy : 'name';
  const direction =
    typeof query.sortDirection === 'string' ? query.sortDirection : 'asc';

  const data = await getFolderData(
    res.locals.currentUser!.id,
    null,
    sortBy,
    direction,
  );

  res.render('index', {
    ...data,
    errors: null,
    oldInput: null,
    sortBy,
    direction,
    currentFolderId: req.params.folderId || null,
  });
});
