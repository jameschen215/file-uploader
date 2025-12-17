import path from 'path';
import sharp from 'sharp';

import prisma from '../lib/prisma.js';
import { ALLOWED_FILE_TYPES } from '../lib/constants.js';
import { configureSupabase } from '../config/supabase.config.js';
import { throwSupabaseError } from '../lib/supabase-helpers.js';
import { generateVideoThumbnail, getVideoMetadata } from '../lib/utils.js';
import { RequestHandler } from 'express';

const supabase = configureSupabase();

export const handleUploadFiles: RequestHandler = async (req, res) => {
  // Get user and folder info
  const userId = res.locals.currentUser!.id;
  const folderId = req.params.folderId || null;

  // TEST: Force error for testing
  if (req.query.testError === 'true') {
    return res.status(500).json({
      success: false,
      message: 'Simulated error for testing.',
      data: null,
    });
  }

  try {
    // Verify folder ownership if specified
    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId, userId },
      });

      if (!folder) {
        return res.status(404).json({
          success: false,
          message: 'Folder not found.',
          data: null,
        });
      }
    }

    const filesArray = req.files as Express.Multer.File[];

    // Validate file types
    const invalidTypes = filesArray
      .filter(
        (file) =>
          !ALLOWED_FILE_TYPES.some((type) => file.mimetype.startsWith(type)),
      )
      .map((file) => path.extname(file.originalname));

    if (invalidTypes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type(s).',
        data: null,
      });
    }

    // Process each file with individual error tracking
    const uploadedFiles = [];
    const failedFiles = [];
    const uploadedPaths = []; // Track for cleanup

    for (const file of filesArray) {
      try {
        const fileName =
          Date.now() +
          '-' +
          Math.round(Math.random() * 1e9) +
          '-' +
          file.originalname;

        // SUPABASE STORAGE
        const supabasePath = `uploads/${userId}/${folderId ? `folder-${folderId}` : 'root'}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('files')
          .upload(supabasePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (uploadError) {
          throwSupabaseError(uploadError, 'upload file(s)');
        }

        // Track for potential cleanup
        uploadedPaths.push(supabasePath);

        // Extract metadata based on file type
        let width = null;
        let height = null;
        let duration = null;
        let thumbnailPath = null;

        if (file.mimetype.startsWith('image/')) {
          // Images: Just extract metadata, no thumbnail needed
          const metadata = await sharp(file.buffer).metadata();
          width = metadata.width || null;
          height = metadata.height || null;
        } else if (file.mimetype.startsWith('video/')) {
          // Videos: Extract metadata AND generate thumbnail
          const metadata = await getVideoMetadata(file.buffer);
          const videoStream = metadata.streams.find(
            (s: any) => s.codec_type === 'video',
          );

          width = videoStream?.width || null;
          height = videoStream?.height || null;
          duration = metadata.format.duration
            ? Math.floor(metadata.format.duration)
            : null;

          // Generate thumbnail
          const thumbnailBuffer = await generateVideoThumbnail(file.buffer, {
            width: 480,
            height: Math.floor(
              width && height ? 480 / (width / height) : 480 / (4 / 3),
            ),
          });
          const thumbnailFileName = fileName.replace(/\.[^.]+$/, '-thumb.jpg');
          thumbnailPath = `uploads/${userId}/${folderId || 'root'}/${thumbnailFileName}`;

          const { error: thumbError } = await supabase.storage
            .from('files')
            .upload(thumbnailPath, thumbnailBuffer, {
              contentType: 'image/jpeg',
              upsert: false,
            });

          if (thumbError) {
            throwSupabaseError(thumbError, 'generate thumbnail(s)');
          }

          uploadedPaths.push(thumbnailPath); // Track thumbnail too
        }

        // Save file metadata to database
        const savedFile = await prisma.file.create({
          data: {
            originalName: file.originalname,
            fileName,
            filePath: supabasePath,
            thumbnailPath,
            fileSize: file.size,
            mimeType: file.mimetype,
            width,
            height,
            duration,
            userId,
            folderId,
          },
        });

        uploadedFiles.push(savedFile);
      } catch (fileError) {
        console.error(
          `Error processing file ${file.originalname}: `,
          fileError,
        );
        failedFiles.push({
          fileName: file.originalname,
          error:
            fileError instanceof Error ? fileError.message : 'Unknown error',
        });

        // Cleanup uploaded files for this iteration
        for (const pathToDelete of uploadedPaths.slice(-2)) {
          await supabase.storage.from('files').remove([pathToDelete]);
        }
      }
    }

    // Handle partial success
    if (failedFiles.length > 0 && uploadedFiles.length === 0) {
      // All files failed
      return res.status(500).json({
        success: false,
        message: 'All files failed to upload.',
        data: { failedFiles },
      });
    }

    if (failedFiles.length > 0) {
      // Some files succeeded, some failed - 207 Multi-state
      return res.status(207).json({
        success: true,
        message: `${uploadedFiles.length} file(s) uploaded successfully, ${failedFiles.length} failed.`,
        data: { uploadedFiles, failedFiles },
      });
    }

    // All files succeeded
    // a. update user's storage used
    const newTotal = uploadedFiles.reduce((s, f) => s + f.fileSize, 0);
    await prisma.user.update({
      where: { id: userId },
      data: {
        storageUsed: {
          increment: newTotal,
        },
      },
    });

    // b. send success response
    res.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully.`,
      data: { files: uploadedFiles },
    });
  } catch (error) {
    console.error('Unexpected error uploading files:', error);

    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while uploading files.',
      data: null,
    });
  }
};
