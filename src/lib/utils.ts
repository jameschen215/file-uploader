import { tmpdir } from 'os';
import { join } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { writeFile, readFile, unlink } from 'fs/promises';
import { BreadcrumbFolderType } from '../types/path.js';

export const formatFileSize = (fileSize: number) => {
  if (fileSize < 2 ** 20) {
    return Math.ceil(fileSize / 1024) + ' KB';
  }
  return (fileSize / 1024 / 1024).toFixed(1) + ' MB';
};

export async function getVideoMetadata(buffer: Buffer): Promise<any> {
  // 1. Create a unique temporary file path
  // tmpdir() = OS temp directory (/tmp on Linux/Mac, C:\Temp on Windows)
  // Date.now() = current timestamp to make filename unique
  const tempPath = join(tmpdir(), `${Date.now()}-video.mp4`);

  try {
    // 2. Write the buffer (video data in memory) to a temporary file on disk
    await writeFile(tempPath, buffer);

    // 3. Run ffprobe on the file path to extract metadata
    // This spawns the ffmpeg binary as a separate process
    return await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(tempPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });
  } finally {
    // 4. Delete the temporary file (cleanup)
    // This runs whether the operation succeeded or failed
    try {
      await unlink(tempPath);
    } catch (error) {
      console.error('Failed to cleanup temp file: ', error);
    }
  }
}

/**
 * ❌ This doesn't work - ffprobe can't read from a Buffer directly
 * ffmpeg.ffprobe(buffer, callback); // ERROR!
 *
 * ✅ This works - ffprobe needs a file path
 * ffmpeg.ffprobe('/path/to/video.mp4', callback); // OK!
 *
 * ------------------------------------------------------
 * Why does ffprobe need a file path?
 * FFmpeg is a **command-line tool** written in C, not a JavaScript library.
 * Under the hood, `fluent-ffmpeg` spawns a separate process that runs the
 * actual `ffmpeg` binary on your system:
 * Your Node.js app → fluent-ffmpeg (JS wrapper) → ffmpeg binary (C program) → reads file from disk
 *
 * Visual flow:
 * 1. Video uploaded → stored in memory as Buffer
 * 2. Buffer written to disk as temporary file: /tmp/1699999999-video.mp4
 * 3. ffmpeg binary reads the file and extracts metadata
 * 4. Metadata returned to your code
 * 5. Temporary file deleted from disk
 */

export async function generateVideoThumbnail(
  buffer: Buffer,
  options: {
    timestamp?: string; // e.g., '00:00:01' or '1' (seconds)
    width?: number;
    height?: number;
  } = {},
): Promise<Buffer> {
  const { timestamp = '1', width = 320, height = 240 } = options;

  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const tempVideoPath = join(tmpdir(), `${uniqueId}-video.mp4`);
  const thumbFilename = `${uniqueId}-thumb.jpg`;
  const tempThumbPath = join(tmpdir(), thumbFilename);

  try {
    // Write video to temp file
    await writeFile(tempVideoPath, buffer);

    // Generate thumbnail at 1 second mark
    await new Promise((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: thumbFilename, // Just the filename, not full path
          folder: tmpdir(), // Specify folder separately
          size: `${width}x${height}`, // Thumbnail size
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Read the generated thumbnail
    const thumbnailBuffer = await readFile(tempThumbPath);

    return thumbnailBuffer;
  } finally {
    // Cleanup temp files (use try-catch for each to handle missing files gracefully)
    try {
      await unlink(tempVideoPath);
    } catch (err) {
      // Ignore if file doesn't exist
      console.error('Failed to clean up temp video files');
    }

    try {
      await unlink(tempThumbPath);
    } catch (err) {
      // Ignore if file doesn't exist
      console.error('Failed to clean up temp thumbnail files');
    }
  }
}
