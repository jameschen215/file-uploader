// share.controller.ts
import crypto from 'crypto';

import {
  CustomBadRequestError,
  CustomInternalError,
  CustomNotFoundError,
} from '../errors/index.js';
import prisma from '../lib/prisma.js';
import { RequestHandler } from 'express';
import { configureSupabase } from '../config/supabase.js';
import { throwSupabaseError } from '../lib/supabase-helpers.js';

const supabase = configureSupabase();

// Authenticated
export const createShareLink: RequestHandler = async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = res.locals.currentUser!.id;

    if (type === 'file') {
      // Handle file sharing
      let file = await prisma.file.findFirst({
        where: { id, userId },
      });

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // If file already has share, use existing
      if (file.shareToken) {
        const shareUrl = `${req.protocol}://${req.get('host')}/share/file/${file.shareToken}`;
        return res.json({ success: true, shareUrl });
      }

      // Create new share
      const shareToken = crypto.randomBytes(16).toString('hex');
      await prisma.file.update({
        where: { id },
        data: { shareToken },
      });

      const shareUrl = `${req.protocol}://${req.get('host')}/share/file/${shareToken}`;
      res.json({ success: true, shareUrl });
    } else if (type === 'folder') {
      // Handle folder sharing

      let folder = await prisma.folder.findFirst({
        where: { id, userId },
      });

      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' });
      }

      // If folder already has token, return it
      if (folder.shareToken) {
        const shareUrl = `${req.protocol}://${req.get('host')}/share/folder/${folder.shareToken}`;
        return res.json({ success: true, shareUrl });
      }

      // Create share token
      const shareToken = crypto.randomBytes(16).toString('hex');
      await prisma.folder.update({
        where: { id },
        data: { shareToken },
      });

      const shareUrl = `${req.protocol}://${req.get('host')}/share/folder/${shareToken}`;
      return res.json({ success: true, shareUrl });
    } else {
      res.status(404).json({ error: 'Invalid type' });
    }
  } catch (error) {
    console.error('Share error: ', error);
    res.status(500).json({ error: 'Failed to generate share link' });
  }
};

export const viewSharedFile: RequestHandler = async (req, res) => {
  try {
    const { token } = req.params;

    const file = await prisma.file.findUnique({
      where: { shareToken: token },
      include: { user: { select: { email: true } } },
    });

    if (!file) {
      throw new CustomNotFoundError('Shared file not found');
    }

    res.render('shared-file', { file, shareToken: token });
  } catch (error) {
    console.error('View shared file error: ', error);
    throw new CustomInternalError('Failed to access shared file');
  }
};

export const downloadSharedFile: RequestHandler = async (req, res) => {
  try {
    const { token } = req.params;

    const file = await prisma.file.findUnique({
      where: { shareToken: token },
    });

    if (!file) {
      throw new CustomNotFoundError('Shared file not found');
    }

    // Handle supabase storage
    const { data, error } = await supabase.storage
      .from('files')
      .download(file.filePath);

    if (error) {
      throwSupabaseError(error, 'Download file');
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.originalName}"`,
    );
    res.setHeader('Content-Type', file.mimeType);
    res.send(buffer);
  } catch (error) {
    console.error('Download shared file error: ', error);
    res.status(500).json({ error: 'Download failed' });
  }
};

export const viewSharedFolder: RequestHandler = async (req, res) => {
  try {
    const { token } = req.params;

    const folder = await prisma.folder.findUnique({
      where: { shareToken: token },
      include: { user: { select: { email: true } } },
    });

    if (!folder) {
      throw new CustomNotFoundError('Shared folder not found');
    }

    // Get subfolders
    const subfolders = await prisma.folder.findMany({
      where: { parentFolderId: folder.id },
      include: {
        _count: { select: { files: true, subFolders: true } },
      },
      orderBy: { name: 'asc' },
    });

    // Get files in folder
    const files = await prisma.file.findMany({
      where: { folderId: folder.id },
      orderBy: { originalName: 'asc' },
    });

    res.render('shared-folder', {
      folder,
      subfolders,
      files,
      shareToken: token,
    });
  } catch (error) {
    console.error('View shared folder error: ', error);
    throw new CustomInternalError('Failed to access shared folder');
  }
};

export const downloadFileFromSharedFolder: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { token, fileId } = req.params;

    // Verify folder is shared
    const folder = await prisma.folder.findUnique({
      where: { shareToken: token },
    });

    if (!folder) {
      throw new CustomNotFoundError('Shared folder not found');
    }

    // Get file and verify it belongs to this folder
    const file = await prisma.file.findFirst({
      where: { id: fileId, folderId: folder.id },
    });

    if (!file) {
      throw new CustomNotFoundError('File not found in shared folder');
    }

    // supabase storage
    const { data, error } = await supabase.storage
      .from('files')
      .download(file.filePath);

    if (error) {
      throwSupabaseError(error, 'Download file');
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.originalName}"`,
    );
    res.setHeader('Content-Type', file.mimeType);
    res.send(buffer);
  } catch (error) {
    console.error('Download from shared folder error:', error);
    throw new CustomInternalError('Download failed');
  }
};

export const previewSharedFile: RequestHandler = async (req, res) => {
  try {
    const { token } = req.params;

    const file = await prisma.file.findUnique({
      where: { shareToken: token },
    });

    if (!file) {
      throw new CustomNotFoundError('Shared file not found');
    }

    // Only allow preview for images and videos
    if (
      !file.mimeType.startsWith('image/') &&
      !file.mimeType.startsWith('video/')
    ) {
      throw new CustomBadRequestError(
        'Preview not available for this file type',
      );
    }

    // Supabase storage
    const { data, error } = await supabase.storage
      .from('files')
      .download(file.filePath);

    if (error) {
      throwSupabaseError(error, 'Download file');
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    res.setHeader('Content-Type', file.mimeType);
    res.send(buffer);
  } catch (error) {
    console.error('Preview error:', error);
    throw new CustomInternalError('Preview failed');
  }
};
