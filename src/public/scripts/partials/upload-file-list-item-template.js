import { icon } from '../lib/get-icon.js';
import { formatFileSize } from '../lib/utils.js';

/**
 * Generate file list item element from upload-file-list-item template
 * @param {Object} file
 * @param {number} index
 */
export function getUploadFileListItem(file, index) {
  const template = document.querySelector('#upload-file-list-item-template');

  if (!template) return;

  const clone = template.content.firstElementChild.cloneNode(true);

  // 1. Get file icon
  clone.querySelector('.file-icon').innerHTML = file.type.startsWith('image/')
    ? icon({ name: 'Image', size: 28, strokeWidth: 1.5 })
    : file.type.startsWith('video/')
      ? icon({ name: 'Film', size: 28, strokeWidth: 1.5 })
      : icon({ name: 'File', size: 28, strokeWidth: 1.5 });

  // 2. Get file name
  clone.querySelector('.file-name').textContent = file.name;

  // 3. Get file size
  clone.querySelector('.file-size').textContent = formatFileSize(file.size);

  // 4. set data-index on button
  clone.querySelector('.clear-file-btn').dataset.index = index;

  return clone;
}
