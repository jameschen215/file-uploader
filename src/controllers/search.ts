import prisma from '../lib/prisma.js';
import { RequestHandler } from 'express';
import { CustomInternalError } from '../errors/index.js';

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

export const handleDesktopSearch: RequestHandler = async (req, res) => {
  try {
    const query = req.query;
    const q = typeof query.q === 'string' ? query.q : '';

    console.log({ q });

    if (!q) return res.json([]);

    const files = await prisma.file.findMany({
      where: { originalName: { contains: q, mode: 'insensitive' } },
      orderBy: { uploadedAt: 'desc' },
    });

    res.render('search', { files, q });
  } catch (error) {
    throw new CustomInternalError('Failed to search files');
  }
};
