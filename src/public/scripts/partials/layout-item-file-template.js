import { icon } from '../lib/get-icon.js';

export function getFileItem(file) {
  const template = document.querySelector('#file-item-template');

  if (!template) return;

  const clone = template.content.firstElementChild.cloneNode(true);

  // 1. add button id
  clone.id = `file-${file.id}`;

  // 2. attach file to card
  clone.dataset.file = JSON.stringify(file);

  // 3. add card name
  clone.querySelector('.file-name').textContent = file.originalName;

  // 4. add file icon
  const imageIcon = icon({
    name: 'Image',
    strokeWidth: 1,
    className: 'w-full h-auto',
  });
  const videoIcon = icon({
    name: 'Film',
    strokeWidth: 1,
    className: 'w-full h-auto',
  });
  const fileIcon = icon({
    name: 'File',
    strokeWidth: 1,
    className: 'w-full h-auto',
  });

  const iconEl = clone.querySelector('.item-icon');
  iconEl.innerHTML = file.mimeType.startsWith('image')
    ? imageIcon
    : file.mimeType.startsWith('video')
      ? videoIcon
      : fileIcon;

  return clone;
}
