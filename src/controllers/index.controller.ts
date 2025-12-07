// export { handleGetFolderContent } from './folder.controller.js';

import { asyncHandler } from '../lib/async-handler.js';
import { getFolderData } from '../lib/get-folder-data.js';

export const handleGetFolderContent = asyncHandler(async (req, res) => {
  const query = req.query;
  const sortBy = typeof query.sortBy === 'string' ? query.sortBy : 'name';
  const direction =
    typeof query.sortDirection === 'string' ? query.sortDirection : 'asc';

  const data = await getFolderData(
    res.locals.currentUser!.id,
    req.params.folderId || null,
    sortBy,
    direction,
  );

  res.render('index', {
    ...data,
    errors: null,
    oldInput: null,
    sortBy,
    direction,
  });

  // res.json({ ...data, errors: null, oldInput: null, sortBy, direction });
});
