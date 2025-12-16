import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';

import prisma from '../lib/prisma.js';
import { asyncHandler } from '../lib/async-handler.js';
import { CustomNotFoundError } from '../errors/index.js';

export const getOwnProfile = asyncHandler(async (req, res) => {
  const userId = res.locals.currentUser!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      folders: true,
      files: true,
      storageUsed: true,
      storageLimit: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new CustomNotFoundError('User not found');
  }

  res.render('profile', { user });
});

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

export const getUpdatePasswordPage: RequestHandler = (_req, res) => {
  res.render('update-password', { errors: null, oldInput: null });
};

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

export const getAllUsers = asyncHandler(async (req, res) => {
  res.send('All Users');
});

export const getUserProfile = asyncHandler(async (req, res) => {
  res.render('profile');
});
