import prisma from '../lib/prisma.js';
import { asyncHandler } from '../lib/async-handler.js';
import {
  CustomForbiddenError,
  CustomGoneError,
  CustomNotFoundError,
} from '../errors/index.js';
import { RequestHandler } from 'express';
import { configureSupabase } from '../config/supabase.js';

const supabase = configureSupabase();

// 1. View shared file page - public
export const viewSharedFile = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Find share record
  const share = await prisma.fileShare.findUnique({
    where: { token },
    include: {
      file: {
        include: {
          user: {
            select: { email: true, id: true },
          },
        },
      },
    },
  });

  if (!share) {
    throw new CustomNotFoundError('Share link not found or has expired');
  }

  // Check if expired
  if (share.expiresAt && share.expiresAt < new Date()) {
    throw new CustomGoneError('This share link has expired');
  }

  // Check access limit
  if (share.maxAccess && share.accessCount >= share.maxAccess) {
    throw new CustomForbiddenError(
      'This share link has reached its access limit',
    );
  }

  // Render share page
  res.render('shared-file', {
    file: share.file,
    share: {
      token: share.token,
      expiresAt: share.expiresAt,
      accessCount: share.accessCount,
      maxAccess: share.maxAccess,
    },
  });
});

// 2. Download the shared file - public
export const downloadSharedFile: RequestHandler = async (req, res) => {
  try {
    const { token } = req.params;

    const share = await prisma.fileShare.findUnique({
      where: { token },
      include: { file: true },
    });

    if (!share) {
      return res.status(404).json({ error: 'Shared link not found' });
    }

    if (share.expiresAt && share.expiresAt <= new Date()) {
      return res.status(410).json({ error: 'Share link expired' });
    }

    if (share.maxAccess && share.accessCount >= share.maxAccess) {
      return res.status(403).json({ error: 'Access limit reached' });
    }

    // Increment access count
    await prisma.fileShare.update({
      where: { id: share.id },
      data: {
        accessCount: share.accessCount + 1,
      },
    });

    // SUPABASE STORAGE
    const file = share.file;
    const { data, error } = await supabase.storage
      .from('files')
      .download(file.filePath);

    if (error) {
      return res.status(500).json({ error: 'Download failed' });
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    res.setHeader(
      'Content-disposition',
      `attachment; filename="${file.originalName}"`,
    );
    res.setHeader('Content-Type', file.mimeType);
    res.send(buffer);
  } catch (error) {
    console.error('Download shared file error: ', error);
    res.status(500).json({ error: 'Download failed' });
  }
};
