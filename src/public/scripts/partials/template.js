import { icon } from '../lib/get-icon.js';

export function getFileCard(file) {
  const template = document.querySelector('#file-card-template');
  const clone = template.content.firstElementChild.cloneNode(true);

  // 1. add button id
  clone.id = `file-details-trigger-${file.id}`;

  // 2. attach file to card
  clone.dataset.file = JSON.stringify(file);

  // 3. add card name
  clone.querySelector('.file-name').textContent = file.originalName;

  // 4. add file thumbnail
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

  const thumbnailEl = clone.querySelector('#file-thumbnail');
  thumbnailEl.innerHTML = file.mimeType.startsWith('image')
    ? imageIcon
    : file.mimeType.startsWith('video')
      ? videoIcon
      : fileIcon;

  return clone;
}

export function getFolderCard(folder) {
  const template = document.querySelector('#folder-card-template');
  const clone = template.content.firstElementChild.cloneNode(true);

  // 1. add href
  clone.href = `/folders/${folder.id}`;

  // 2. add folder name
  clone.querySelector('.folder-name').textContent = folder.name;

  // 3. update button attributes
  const button = clone.querySelector('button');
  button.id = `folder-details-trigger-${folder.id}`;
  button.dataset.folder = JSON.stringify(folder);

  return clone;
}
