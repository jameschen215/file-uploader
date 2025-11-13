import { asyncHandler } from '../lib/async-handler.js';

export const handleGetFiles = asyncHandler(async (req, res) => {
  res.send('Homepage');
});
