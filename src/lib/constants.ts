export const SALT_ROUND = 10;

export const ALLOWED_FILE_TYPES = [
  'image/',
  'video/',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats',
  'application/vnd.ms-excel',
];

export const MAX_FILES = 3;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const SORT_BY_METHODS = {
  name: { folder: 'name', file: 'originalName' },
  size: { folder: 'name', file: 'fileSize' },
  date: { folder: 'updatedAt', file: 'uploadedAt' },
};
export const SORT_ORDERS = ['asc', 'desc'];
