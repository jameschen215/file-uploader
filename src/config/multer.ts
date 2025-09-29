import multer from 'multer';
import { ALLOWED_FILE_TYPES } from '../lib/constants.js';

export function configureMulter(
  filedName: string,
  maxSize: number,
  maxCount: number,
) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * maxSize, files: maxCount },
  }).array(filedName, maxCount);
}
