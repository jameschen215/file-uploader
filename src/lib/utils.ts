export const formatFileSize = (fileSize: number) => {
  if (fileSize < 2 ** 20) {
    return Math.ceil(fileSize / 1024) + 'KB';
  }
  return (fileSize / 1024 / 1024).toFixed(1) + 'MB';
};
