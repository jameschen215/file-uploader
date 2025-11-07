import { icon } from './icons.js';
import { formatTime } from './utils.js';

export function handleShowFileInfo(file) {
  document.querySelector('#modal-file-name').textContent = file.originalName;
  document.querySelector('#modal-file-size').textContent = file.fileSize;
  document.querySelector('#modal-file-type').textContent = file.mimeType;
  document.querySelector('#modal-file-date').textContent = file.uploadedAt;

  // Show thumbnail for images and videos
  const previewDiv = document.querySelector('#modal-file-preview');
  if (file.mimeType.startsWith('image')) {
    previewDiv.innerHTML = `
      <div class="flex items-center justify-center">
        <img src="files/${file.id}/thumbnail" alt="File preview" />
      </div>
    `;
  } else if (file.mimeType.startsWith('video')) {
    previewDiv.innerHTML = `
      <div class="relative flex items-center justify-center">
        <img src="files/${file.id}/thumbnail" alt="File preview" />
        <div class="absolute top-0 left-0 size-full bg-gray-700 opacity-25"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-200">
          ${icon({ name: 'Play', size: 32, fill: 'currentColor' })}
        </div>
      </div>
    `;
  } else {
    previewDiv.innerHTML = icon({ name: 'File', size: 144, strokeWidth: 1 });
  }

  // Show resolution if available
  const resolutionContainer = document.getElementById(
    'modal-resolution-container',
  );
  const resolutionEl = document.getElementById('modal-file-resolution');

  if (file.width && file.height) {
    resolutionEl.textContent = `${file.width} x ${file.height}`;
    resolutionContainer.classList.remove('hidden');
    resolutionContainer.classList.add('flex');
  } else {
    resolutionEl.textContent = '';
    resolutionContainer.classList.remove('flex');
    resolutionContainer.classList.add('hidden');
  }

  // Show duration if available
  const durationContainer = document.getElementById('modal-duration-container');
  const durationEl = document.getElementById('modal-file-duration');

  if (file.duration) {
    durationEl.textContent = `${formatTime(file.duration)}`;
    durationContainer.classList.remove('hidden');
    durationContainer.classList.add('flex');
  } else {
    durationEl.textContent = '';
    durationContainer.classList.remove('flex');
    durationContainer.classList.add('hidden');
  }
}
