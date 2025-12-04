import { validationResult } from 'express-validator';

import prisma from '../lib/prisma.js';
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

  const newFolder = await prisma.folder.create({
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
    folder: newFolder,
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

export const handleDeleteFolder = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  const userId = res.locals.currentUser!.id;

  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId },
    include: { _count: { select: { files: true, subFolders: true } } },
  });

  if (!folder) {
    // throw new CustomNotFoundError('Folder not found');
    return res.json({
      success: false,
      message: 'Folder not found',
      data: null,
    });
  }

  if (folder._count.files > 0 || folder._count.subFolders > 0) {
    return res.json({
      success: false,
      message: 'Failed to delete a non-empty folder.',
      folder: null,
    });
  }

  // Since Supabase don't create empty folder, so you don't need to delete it
  // Just delete it from local database
  await prisma.folder.delete({
    where: { id: folderId },
  });

  res.json({
    success: true,
    message: `Folder ${folder.name} has been deleted successfully.`,
    folder: folder,
  });
});

export const handleRenameFolder = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  const userId = res.locals.currentUser!.id;
  const errors = validationResult(req);

  console.log(req.body);

  if (!errors.isEmpty()) {
    console.log('Error');
    console.log(errors.mapped());
    return res.status(400).json({
      success: false,
      errors: errors.mapped(),
      oldInput: req.body,
    });
  }
  const { name, parentFolderId } = req.body;

  console.log({ name, folderId, parentFolderId });

  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
  });

  if (!folder || folder.userId !== userId) {
    return res.json({
      success: false,
      message: 'Folder not found',
      data: null,
    });
  }

  const updatedFolder = await prisma.folder.update({
    where: { id: folderId },
    data: {
      name,
      parentFolderId: parentFolderId || null,
    },
  });

  res.json({
    success: true,
    message: 'Folder has been renamed successfully.',
    folder: updatedFolder,
  });
});
