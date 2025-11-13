import { format } from 'date-fns';
import { CustomNotFoundError } from '../errors/index.js';
import { buildPath } from './build-path.js';
import { SORT_BY_METHODS, SORT_ORDERS } from './constants.js';
import prisma from './prisma.js';
import { formatFileSize } from './utils.js';

export async function getHomepageData(
  userId: string,
  folderId: string | null,
  sortBy: string,
  direction: string,
) {
  const sortField = Object.keys(SORT_BY_METHODS).includes(sortBy)
    ? SORT_BY_METHODS[sortBy as keyof typeof SORT_BY_METHODS]
    : SORT_BY_METHODS['name'];
  const sortOrder = SORT_ORDERS.includes(direction) ? direction : 'asc';

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
    where: { parentFolderId: folderId, userId },
    include: {
      _count: { select: { files: true, subFolders: true } },
    },
    orderBy: { [sortField.folder]: sortOrder },
  });

  console.log({ folders });

  // Get files in current folder
  const files = await prisma.file.findMany({
    where: { folderId: folderId || null, userId },
    orderBy: { [sortField.file]: sortOrder },
  });

  const formattedFiles = files.map((file) => ({
    ...file,
    fileSize: formatFileSize(file.fileSize),
    uploadedAt: format(file.uploadedAt, 'yyyy-MM-dd'),
  }));

  return { currentFolder, breadcrumbs, folders, files: formattedFiles };
}
