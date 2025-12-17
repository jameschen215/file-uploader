import { RequestHandler } from 'express';

import {
  CustomBadRequestError,
  CustomInternalError,
  CustomNotFoundError,
} from '../errors/index.js';
import prisma from '../lib/prisma.js';
import { asyncHandler } from '../lib/async-handler.js';
import { configureSupabase } from '../config/supabase.config.js';
import { throwSupabaseError } from '../lib/supabase-helpers.js';

const supabase = configureSupabase();

export const handleGetFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId = res.locals.currentUser!.id;

  const file = await prisma.file.findUnique({
    where: { id: fileId, userId },
  });

  if (!file) {
    throw new CustomNotFoundError('File not found');
  }

  res.json({
    success: true,
    message: 'Get file successfully',
    data: file,
  });
});

export const handleDownloadFile = asyncHandler(async (req, res) => {
  const fileId = req.params.fileId;
  const userId = res.locals.currentUser!.id;

  // Get file from database
  const file = await prisma.file.findFirst({
    where: { id: fileId, userId },
  });

  if (!file) {
    throw new CustomNotFoundError('File not found');
  }

  // supabase storage
  const { data, error } = await supabase.storage
    .from('files')
    .download(file.filePath);

  if (error) {
    throwSupabaseError(error, 'download file');
  }

  // Convert blob to buffer and send
  const buffer = Buffer.from(await data.arrayBuffer());

  /**
   * WHAT IT DOES HERE?
   * - Tells browser what type of file it is (image/jpeg, application/pdf, etc.)
   * - Browser uses this to handle the file correctly
   * - 'attachment': tells browser to download the file instead of displaying it
   * - 'filename="${file.originalName}": sets the download file's name
   *
   * WHY IT MATTERS?
   * - Window uses it to suggest the right program to open the file
   * - Browser knows if it's safe to download
   * - Prevents browser form trying to display binary files as text
   *
   */

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${file.originalName}"`,
  );
  res.setHeader('Content-Type', file.mimeType);
  res.send(buffer);
});

// Handle generating thumbnails for images and videos
export const handleGetThumbnail = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  const file = await prisma.file.findFirst({
    where: { id: fileId, userId: res.locals.currentUser!.id },
  });

  if (!file) {
    throw new CustomNotFoundError('File not found');
  }

  // Images: Use Supabase transformation (fast, on-the-fly)
  if (file.mimeType.startsWith('image/')) {
    const { data, error } = await supabase.storage
      .from('files')
      .createSignedUrl(file.filePath, 3600, {
        transform: {
          width: 480,
          height: Math.floor((480 / file.width!) * file.height!),
          resize: 'cover',
        },
      });

    if (error) {
      throw new CustomInternalError('Failed to generate thumbnail');
    }

    return res.redirect(data.signedUrl);
  }

  // Videos: Use pre-generated thumbnail (fast, from storage)
  if (file.mimeType.startsWith('video/') && file.thumbnailPath) {
    const { data, error } = await supabase.storage
      .from('files')
      .createSignedUrl(file.thumbnailPath, 3600);

    if (error) {
      throw new CustomInternalError('Failed to fetch thumbnail for the video');
    }

    return res.redirect(data.signedUrl);
  }

  // Fallback: No thumbnail available
  res.status(404).send('Thumbnail not available');
});

export const handleDeleteFile: RequestHandler = async (req, res) => {
  const { fileId } = req.params;
  const userId = res.locals.currentUser!.id;

  // TEST: Force error for testing
  if (req.query.testError === 'true') {
    return res.status(500).json({
      success: false,
      message: 'Simulated error for testing.',
      data: null,
    });
  }

  try {
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
    });

    if (!file) {
      // throw new CustomNotFoundError('File not found.');
      return res.status(404).json({
        success: false,
        message: 'File not found.',
        data: null,
      });
    }

    // Collect all files to delete, in case there exists a thumbnail of the file
    const filesToDelete = [file.filePath];
    if (file.thumbnailPath) {
      filesToDelete.push(file.thumbnailPath);
    }

    // Delete from Supabase storage first
    const { error: storageError } = await supabase.storage
      .from('files')
      .remove(filesToDelete);

    if (storageError) {
      console.error('Storage deletion failed:', storageError);

      return res.status(500).json({
        success: false,
        message: 'Error deleting file from storage.',
        data: null,
      });
    }

    // Only delete from database if storage deletion succeeded
    await prisma.file.delete({
      where: { id: fileId },
    });

    // Update user's storage used - decrease size of deleted file
    // a. Get current storage and only decrement if it won't go negative
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { storageUsed: true },
    });

    if (user && user.storageUsed >= file.fileSize) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          storageUsed: {
            decrement: file.fileSize,
          },
        },
      });
    } else {
      // If storage is already less than file size, just set to 0
      await prisma.user.update({
        where: { id: userId },
        data: {
          storageUsed: 0,
        },
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully.',
      data: file,
    });
  } catch (error) {
    console.error('Error deleting file: ', error);

    return res.status(500).json({
      success: false,
      message: 'Error deleting file.',
      data: null,
    });
  }
};

// File preview
export const handleGetFilePreview: RequestHandler = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = res.locals.currentUser!.id;

    const file = await prisma.file.findUnique({
      where: { id: fileId, userId },
    });

    if (!file) {
      throw new CustomNotFoundError('File not found');
    }

    // Only allow preview for images and videos
    if (
      !file.mimeType.startsWith('image/') &&
      !file.mimeType.startsWith('video/')
    ) {
      throw new CustomBadRequestError(
        'Preview not available for this file type',
      );
    }

    // Supabase storage
    const { data, error } = await supabase.storage
      .from('files')
      .download(file.filePath);

    if (error) {
      throwSupabaseError(error, 'Download file');
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    res.setHeader('Content-Type', file.mimeType);
    res.send(buffer);
  } catch (error) {
    console.error('Preview error: ', error);
    throw new CustomInternalError('Preview file failed');
  }
};
