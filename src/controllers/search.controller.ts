import prisma from '../lib/prisma.js';
import { RequestHandler } from 'express';
import { buildPath } from '../lib/build-path.js';

export const handleMobileSearch: RequestHandler = async (req, res) => {
  try {
    const query = req.query.q as string;
    const userId = res.locals.currentUser!.id;

    console.log({ query });

    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const files = await prisma.file.findMany({
      where: { originalName: { contains: query, mode: 'insensitive' }, userId },
      orderBy: { uploadedAt: 'desc' },
    });

    const folders = await prisma.folder.findMany({
      where: { name: { contains: query, mode: 'insensitive' }, userId },
      orderBy: { createdAt: 'desc' },
    });

    // map with async returns an array of Promises, not the actual values.
    // Fix it with Promise.all:
    // const filesWithBreadcrumbs = files.map(async (file) => ({
    //   ...file,
    //   breadcrumbs: await buildPath(userId, file.folderId),
    // }));

    const filesWithBreadcrumbs = await Promise.all(
      files.map(async (file) => ({
        ...file,
        breadcrumbs: await buildPath(userId, file.folderId),
      })),
    );

    const foldersWithBreadcrumbs = await Promise.all(
      folders.map(async (folder) => ({
        ...folder,
        breadcrumbs: await buildPath(userId, folder.id),
      })),
    );

    const results = {
      files: filesWithBreadcrumbs,
      folders: foldersWithBreadcrumbs,
    };

    //  Check if request wants JSON or HTML

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      // AJAX request - return JSON
      return res.json(results);
    }

    // Browser refresh - render HTML page
    res.redirect('/');
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};
