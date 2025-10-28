import prisma from '../lib/prisma.js';
import { RequestHandler } from 'express';
import { asyncHandler } from '../lib/async-handler.js';

export const handleMobileSearch: RequestHandler = async (req, res) => {
  try {
    const query = req.query;
    const q = typeof query.q === 'string' ? query.q : '';

    if (!q) return res.json([]);

    const files = await prisma.file.findMany({
      where: { originalName: { contains: q, mode: 'insensitive' } },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json(files);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search files' });
  }
};

export const handleDesktopSearch = asyncHandler(async (req, res) => {
  const query = req.query;
  const q = typeof query.q === 'string' ? query.q : '';

  if (!q) return res.json([]);

  const files = await prisma.file.findMany({
    where: { originalName: { contains: q, mode: 'insensitive' } },
    orderBy: { uploadedAt: 'desc' },
  });

  res.render('search', { files, q });
});
