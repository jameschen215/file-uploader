import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';

import prisma from '../lib/prisma.js';
import { asyncHandler } from '../lib/async-handler.js';
import { CustomNotFoundError } from '../errors/index.js';
import { configureSupabase } from '../config/supabase.config.js';
import { throwSupabaseError } from '../lib/supabase-helpers.js';

const supabase = configureSupabase();

// --- --- --- --- --- --- GET USER'S OWN PROFILE --- --- --- --- --- ---

export const getOwnProfile = asyncHandler(async (_req, res) => {
  const userId = res.locals.currentUser!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      storageUsed: true,
      storageLimit: true,
      createdAt: true,
      _count: { select: { files: true, folders: true } },
    },
  });

  if (!user) {
    throw new CustomNotFoundError('User not found');
  }

  const lastUpload = await prisma.file.findFirst({
    where: { userId },
    orderBy: { uploadedAt: 'desc' },
    select: { uploadedAt: true },
  });
  const lastUploadDate = lastUpload?.uploadedAt || null;

  const formattedUser = {
    ...user,
    lastUploadDate,
    storagePercentage: ((user.storageUsed / user.storageLimit) * 100).toFixed(
      1,
    ),
  };

  res.render('own-profile', { user: formattedUser });
});

// --- --- --- --- --- --- UPDATE USER PROFILE --- --- --- --- --- ---

export const editOwnProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, errors: errors.mapped(), oldInput: req.body });
  }

  const userId = res.locals.currentUser!.id;
  const { name } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true, name: true },
  });

  res.json({
    success: true,
    message: 'Username updated successfully',
    data: user,
  });
});

// --- --- --- --- --- --- UPDATE USER PASSWORD --- --- --- --- --- ---

export const updateOwnPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  console.log('Error: ', errors.mapped());
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.mapped(),
      oldInput: req.body,
    });
  }

  const userId = res.locals.currentUser!.id;
  const { old_password: oldPassword, new_password: newPassword } = req.body;

  try {
    // 1. Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 2. Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        errors: {
          old_password: {
            msg: 'Current password is incorrect.',
          },
        },
      });
    }

    // 3. Check new password is different
    if (newPassword === oldPassword) {
      return res.status(400).json({
        success: false,
        errors: {
          new_password: {
            msg: 'New password must be different from the current one.',
          },
        },
      });
    }

    // 4. Hash and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    console.error('Error updating password: ', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update password.',
    });
  }
});

// --- --- --- --- --- --- GET ALL USERS --- --- --- --- --- ---

export const getAllUsers = asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      storageUsed: true,
      storageLimit: true,
      _count: { select: { files: true } },
    },
  });

  const formattedUser = users.map((user) => ({
    ...user,
    storagePercentage: ((user.storageUsed / user.storageLimit) * 100).toFixed(
      1,
    ),
  }));

  res.render('users', { users: formattedUser });
});

// --- --- --- --- --- --- GET USER PROFILE BY ID --- --- --- --- --- ---

export const getUserProfileById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      storageUsed: true,
      storageLimit: true,
      createdAt: true,
      _count: { select: { files: true, folders: true } },
    },
  });

  if (!user) {
    throw new CustomNotFoundError('User not found');
  }

  const lastUpload = await prisma.file.findFirst({
    where: { userId },
    orderBy: { uploadedAt: 'desc' },
    select: { uploadedAt: true },
  });
  const lastUploadDate = lastUpload?.uploadedAt || null;

  const formattedUser = {
    ...user,
    lastUploadDate,
    storagePercentage: ((user.storageUsed / user.storageLimit) * 100).toFixed(
      1,
    ),
  };

  res.render('user-profile', { user: formattedUser });
});

// --- --- --- --- --- --- DELETE USER --- --- --- --- --- ---

export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // 1. Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    // throw new CustomNotFoundError('User not found');
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // 2. Retrieve all file paths for cleanup
  // Query this before deleting user, as the database delete will cascade
  // and remove these records
  const userFiles = await prisma.file.findMany({
    where: { userId },
    select: { filePath: true, thumbnailPath: true },
  });

  // 3. Construct list of storage paths to delete
  const pathsToDelete: string[] = [];

  for (const file of userFiles) {
    if (file.filePath) {
      pathsToDelete.push(file.filePath);
    }
    if (file.thumbnailPath) {
      pathsToDelete.push(file.thumbnailPath);
    }
  }

  // 4. Remove files from Supabase storage
  if (pathsToDelete.length > 0) {
    // Supabase .remove() accepts an array of path strings
    const { error: storageError } = await supabase.storage
      .from('files')
      .remove(pathsToDelete);

    if (storageError) {
      // 1. Log the error internally so you know about it
      console.error('Error deleting user files: ', storageError);

      // 2. DO NOT return error. Swallow it and proceed.
      // We want to ensure the user is deleted from the DB regardless of storage hiccups.

      // throwSupabaseError(storageError, 'delete user files from storage');
      // return res.status(500).json({
      //   success: false,
      //   message: 'Error deleting user files from storage',
      // });
    }
  }

  // 5. Delete user from database
  // Based on the schema:
  // - `folders Folder[]` has `onDelete: Cascade` (via User relation)
  // - `files File[]` has `onDelete: Cascade` (via User relation)
  // Therefore, this single call removes the user and all their metadata.
  await prisma.user.delete({
    where: { id: userId },
  });

  res.status(200).json({
    success: true,
    message: 'User and all associated data deleted successfully.',
  });
});
