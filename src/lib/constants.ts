export const SALT_ROUND = 10;

export const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',

  // Videos
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/webm',

  // Documents
  // 'application/pdf',
  // 'application/msword',
  // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // 'application/vnd.ms-excel',
  // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  // Archives
  // 'application/zip',
  // 'application/x-rar-compressed',
];

export const MAX_FILES = 3;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const SORT_BY_METHODS = {
  name: { folder: 'name', file: 'originalName' },
  type: { folder: 'name', file: 'mimeType' },
  size: { folder: 'name', file: 'fileSize' },
  date: { folder: 'updatedAt', file: 'uploadedAt' },
};

export const SORT_ORDERS = ['asc', 'desc'];
