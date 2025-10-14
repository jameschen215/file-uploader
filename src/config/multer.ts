import multer from 'multer';

export function configureMulter(
  filedName: string,
  maxSize: number,
  maxCount: number,
) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSize, files: maxCount },
  }).array(filedName, maxCount);
}
