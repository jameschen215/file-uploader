import { CustomNotFoundError } from '../errors/index.js';
import { buildPath } from './build-path.js';
import prisma from './prisma.js';

export async function getHomepageData(userId: string, folderId: string | null) {
  let currentFolder = null;

  if (folderId) {
    currentFolder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
      include: { parentFolder: { select: { id: true, name: true } } },
    });

    if (!currentFolder) {
      throw new CustomNotFoundError('Folder not found');
    }
  }

  // Build breadcrumbs
  const breadcrumbs = await buildPath(userId, folderId);

  // Get subfolders in current folder
  const folders = await prisma.folder.findMany({
    where: { parentFolderId: folderId || null, userId },
    include: {
      _count: { select: { files: true, subFolders: true } },
    },
    orderBy: { name: 'asc' },
  });

  // Get files in current folder
  const files = await prisma.file.findMany({
    where: { folderId: folderId || null, userId },
    orderBy: { originalName: 'asc' },
  });

  return { currentFolder, breadcrumbs, folders, files };
}
