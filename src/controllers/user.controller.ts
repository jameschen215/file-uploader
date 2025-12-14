import { CustomNotFoundError } from '../errors/index.js';
import { asyncHandler } from '../lib/async-handler.js';
import prisma from '../lib/prisma.js';

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

export const getAllUsers = asyncHandler(async (req, res) => {
  res.send('All Users');
});

export const getUserProfile = asyncHandler(async (req, res) => {
  res.render('profile');
});
