import { RequestHandler } from 'express';

import prisma from '../lib/prisma.js';
import { formatFileSize } from '../lib/utils.js';
import { CustomUnauthorizedError } from '../errors/index.js';

export const checkStorageLimit: RequestHandler = async (req, res, next) => {
  console.log('Check storage limit...');

  const userId = res.locals.currentUser!.id;

  // Check files existence
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files provided.',
      data: null,
    });
  }

  // Calculate total size of files being uploaded
  const uploadedSize = req.files.reduce((sum, file) => sum + file.size, 0);

  console.log(`Uploading ${formatFileSize(uploadedSize)}...`);

  // Check storage limit
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { storageUsed: true, storageLimit: true },
  });

  if (!user) {
    throw new CustomUnauthorizedError('You need to sign in to upload files.');
  }

  const newTotal = user.storageUsed + uploadedSize;

  if (newTotal > user.storageLimit) {
    const remaining = user.storageLimit - user.storageUsed;

    console.log(
      `Storage limit exceeded. You have ${formatFileSize(remaining)} remaining.`,
    );

    // 413 - content too large
    return res.status(413).json({
      success: false,
      message: `Storage limit exceeded. You have ${formatFileSize(remaining)} remaining.`,
      data: null,
    });
  }

  console.log('No exceed.');

  next();
};
