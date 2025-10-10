import prisma from './prisma.js';
import { BreadcrumbFolderType } from '../types/path.js';

export async function buildPath(
  userId: string,
  folderId: string | null | undefined,
  path: BreadcrumbFolderType[] = [],
) {
  if (!folderId) return path;

  const folder = await prisma.folder.findFirst({
    where: { id: folderId, userId },
    select: { id: true, name: true, parentFolderId: true },
  });

  // 1. Base condition - return if no current folder
  if (!folder) return path;

  // 2. Add current folder to breadcrumb array if it exists
  path.unshift(folder);

  // 3. If folder has a parent, do it again for the parent
  if (folder.parentFolderId) {
    return buildPath(folder.parentFolderId, userId, path);
  }

  // 4. return the breadcrumb path
  return path;
}
