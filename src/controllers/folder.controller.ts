import prisma from '../lib/prisma.js';
import { buildPath } from '../lib/build-path.js';
import { validationResult } from 'express-validator';
import { asyncHandler } from '../lib/async-handler.js';
import { CustomNotFoundError } from '../errors/index.js';
import { getFolderData } from '../lib/get-folder-data.js';

export const handleCreateFolder = asyncHandler(async (req, res) => {
  const userId = res.locals.currentUser!.id;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.mapped(),
      oldInput: req.body,
    });
  }

  const { name, parentFolderId } = req.body;

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
});

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
});

export const handleDeleteFolder = asyncHandler(async (req, res) => {});

export const handleRenameFolder = asyncHandler(async (req, res) => {});
