import { icon } from './lib/get-icon.js';
import { formatTime } from './utils.js';

// Store handler references outside the function
let currentDownloadHandler = null;
let currentDeleteHandler = null;
let currentShareHandler = null;

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
        <img src="/files/${file.id}/thumbnail" alt="File preview" />
      </div>
    `;
  } else if (file.mimeType.startsWith('video')) {
    previewDiv.innerHTML = `
      <div class="relative flex items-center justify-center">
        <img src="${file.parentFolderId || ''}/files/${file.id}/thumbnail" alt="File preview" />
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

  // Handlers
  const deleteButton = document.querySelector('#delete-file-btn');
  const shareButton = document.querySelector('#share-file-btn');
  const downloadButton = document.querySelector('#download-file-btn');

  // Remove old listeners if they exist
  if (currentDeleteHandler) {
    deleteButton.removeEventListener('click', currentDeleteHandler);
  }

  if (currentShareHandler) {
    shareButton.removeEventListener('click', currentShareHandler);
  }

  if (currentDownloadHandler) {
    downloadButton.removeEventListener('click', currentDownloadHandler);
  }

  // Create new handlers with the current file data
  currentDeleteHandler = async () => {
    if (!confirm(`Are you sure you want to delete ${file.originalName}?`)) {
      return;
    }

    console.log(`Deleting ${file.originalName}...`);

    try {
      const resp = await fetch(`/files/${file.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!resp.ok) {
        const errorData = await resp
          .json()
          .catch(() => ({ message: 'Failed to delete the file' }));
        alert(errorData.message || 'Failed to delete the file');
        return;
      }

      const data = await resp.json();
      alert(data.message);
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the file');
    }
  };

  currentShareHandler = () => {
    console.log(`Sharing ${file.originalName}...`);
  };

  currentDownloadHandler = () => {
    console.log(`Downloading ${file.originalName}...`);
    window.location.href = `files/${file.id}/download`;
  };

  // Add new listeners
  deleteButton.addEventListener('click', currentDeleteHandler);
  shareButton.addEventListener('click', currentShareHandler);
  downloadButton.addEventListener('click', currentDownloadHandler);
}
