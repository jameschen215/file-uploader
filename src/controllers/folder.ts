import { Prisma } from '@prisma/client';
import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';

import prisma from '../lib/prisma.js';
import { CustomNotFoundError } from '../errors/index.js';

export const createFolder: RequestHandler = async (req, res) => {
  const userId = res.locals.currentUser!.id;
  const parentFolderId = req.params.parentFolderId;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.mapped(),
      oldInput: req.body,
    });
  }

  try {
    const { name } = req.body;

    // Validate parent folder exists and belongs to user (if specified)
    if (parentFolderId) {
      const parentFolder = await prisma.folder.findFirst({
        where: { id: parentFolderId, userId },
      });

      if (!parentFolder) {
        throw new CustomNotFoundError('Parent folder not found');
      }
    }

    await prisma.folder.create({
      data: {
        name: name.trim(),
        userId,
        parentFolderId: parentFolderId || null,
      },
      include: {
        parentFolder: { select: { name: true } },
        _count: { select: { files: true, subFolders: true } },
      },
    });

    res.json({
      success: true,
      message: 'Folder created',
    });
  } catch (error) {
    // Check if it's a Prisma error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        return res
          .status(400)
          .json({ error: 'Folder name already exists in this location' });
      }
    }

    console.error('Create folder error: ', error);

    res.status(500).json({ error: 'Failed to create folder' });
  }
};
