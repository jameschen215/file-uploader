import { RequestHandler } from 'express';
import { UserType } from '../types/user.js';
import prisma from '../lib/prisma.js';
import { CustomNotFoundError } from '../errors/index.js';

export const setCurrentFolder: RequestHandler = async (req, res, next) => {
  const folderId = req.params.folderId || null;
  const userId = res.locals.currentUser!.id;

  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      throw new CustomNotFoundError('Folder not found');
    }

    res.locals.currentFolder = folder;
  }

  next();
};
