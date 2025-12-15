import { RequestHandler } from 'express';
import {
  CustomNotFoundError,
  CustomUnauthorizedError,
} from '../errors/index.js';
import { asyncHandler } from '../lib/async-handler.js';
import prisma from '../lib/prisma.js';
import { validationResult } from 'express-validator';

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

export const getAllUsers = asyncHandler(async (req, res) => {
  res.send('All Users');
});

export const getUserProfile = asyncHandler(async (req, res) => {
  res.render('profile');
});
