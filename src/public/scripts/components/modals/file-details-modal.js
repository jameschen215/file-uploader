import {
  cleanUpDeletingState,
  loadImageWithSpinner,
  removeElementFromDOM,
  setupDeletingState,
} from '../../lib/dom-helpers.js';
import { showToast } from '../toast.js';
import { icon } from '../../lib/get-icon.js';
import { confirmDeletion } from './confirm-modal.js';
import { formateDate, formatFileSize, formatTime } from '../../lib/utils.js';
import { hideModal } from '../../lib/modal-helpers.js';

const BUTTON_DISABLED_DURATION = 1000;

const fileDetailsModal = document.querySelector('#file-details-modal');
const deleteButton = document.querySelector('#delete-file-btn');
const shareButton = document.querySelector('#share-file-btn');
const downloadButton = document.querySelector('#download-file-btn');

// Store handler references outside the function
let currentDownloadHandler = null;
let currentDeleteHandler = null;

console.log('file details modal');

document.addEventListener('file-details-modal-open', (ev) => {
  console.log('Handling details display...');

  const { file, breadcrumbs } = ev.detail;

  if (!(file && breadcrumbs)) return;

  displayFileInfo(file, breadcrumbs);
  addFileActions();
});

function displayFileInfo(file, breadcrumbs) {
  document.querySelector('#file-name').textContent = file.originalName;
  document.querySelector('#file-size').textContent = formatFileSize(
    file.fileSize,
  );
  document.querySelector('#file-created-date').textContent = formateDate(
    file.uploadedAt,
  );

  let fileType = '';
  if (file.mimeType.startsWith('image')) {
    fileType = file.mimeType.split('/')[1].toUpperCase() + ' Image';
  } else if (file.mimeType.startsWith('video')) {
    fileType = file.mimeType.split('/')[1].toUpperCase() + ' Video';
  } else {
    fileType = file.mimeType.split('/')[1].toUpperCase() + ' File';
  }

  document.querySelector('#file-type').textContent = fileType;

  document.querySelector('#file-path').innerHTML =
    breadcrumbs.length === 0
      ? `<a href="/" class="font-medium text-sky-500 rounded-sm focus-visible:outline-none focus-visible:border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:focus-visible:ring-offset-gray-900">Cloud drive</a>`
      : `<a href="/" class="font-medium text-sky-500 rounded-sm focus-visible:outline-none focus-visible:border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:focus-visible:ring-offset-gray-900">Cloud drive</a> &#x203A; ` +
        breadcrumbs
          .map(
            (bc) =>
              `<a href="/folders/${bc.id}" class="font-medium text-sky-500 rounded-sm focus-visible:outline-none focus-visible:border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:focus-visible:ring-offset-gray-900">${bc.name}</a>`,
          )
          .join(' &#x203A; ');

  // Show preview for images and videos
  const previewDiv = document.querySelector('#file-preview');
  if (file.mimeType.startsWith('image')) {
    loadImageWithSpinner(
      previewDiv,
      `/files/${file.id}/preview`,
      file.originalName,
    ).catch((err) => {
      console.error('Failed to load image preview: ', err);
    });
  } else if (file.mimeType.startsWith('video')) {
    previewDiv.innerHTML = `
        <div class="flex items-center justify-center">
          <video controls style="max-width: 100%; border-radius: 4px">
            <source
              src="/files/${file.id}/preview"
              type="${file.mimeType}"
            />
            You browser does't support video playback.
          </video>
        </div>
      `;
  } else {
    previewDiv.innerHTML = icon({
      name: 'File',
      size: 108,
      strokeWidth: 1,
      className: 'text-gray-500',
    });
  }

  // Show resolution if available
  const resolutionWrapper = document.getElementById('file-resolution-wrapper');
  const resolutionEl = document.getElementById('file-resolution');

  if (file.width && file.height) {
    resolutionEl.textContent = `${file.width} x ${file.height}`;
    resolutionWrapper.classList.remove('hidden');
    resolutionWrapper.classList.add('flex');
  } else {
    resolutionEl.textContent = '';
    resolutionWrapper.classList.remove('flex');
    resolutionWrapper.classList.add('hidden');
  }

  // Show duration if available
  const durationWrapper = document.getElementById('file-duration-wrapper');
  const durationEl = document.getElementById('file-duration');

  if (file.duration) {
    durationEl.textContent = `${formatTime(file.duration)}`;
    durationWrapper.classList.remove('hidden');
    durationWrapper.classList.add('flex');
  } else {
    durationEl.textContent = '';
    durationWrapper.classList.remove('flex');
    durationWrapper.classList.add('hidden');
  }

  // Attach file to button dataset
  shareButton.dataset.file = JSON.stringify(file);
  deleteButton.dataset.file = JSON.stringify(file);
  downloadButton.dataset.file = JSON.stringify(file);
}

function addFileActions() {
  // Remove old listeners if they exist
  if (currentDeleteHandler) {
    deleteButton.removeEventListener('click', currentDeleteHandler);
  }

  if (currentDownloadHandler) {
    downloadButton.removeEventListener('click', currentDownloadHandler);
  }

  // Create new handlers with the current file data
  currentDeleteHandler = async () => {
    const file = JSON.parse(deleteButton.dataset.file);
    console.log('Delete file: ', file.originalName, file.id);

    const confirmed = await confirmDeletion({ file });

    if (!confirmed) return;

    // Show loading state
    const originalButtonHTML = deleteButton.innerHTML;
    setupDeletingState(deleteButton);

    try {
      // 1. Request the server to remove the file
      const res = await fetch(`/files/${file.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to delete file.');
      }

      hideModal({ modal: fileDetailsModal });
      removeElementFromDOM(result.data.id);
      showToast(result.message, 'success');
    } catch (error) {
      console.error('Delete error:', error);

      showToast(error.message || 'Failed to delete the file', 'error');
    } finally {
      cleanUpDeletingState(deleteButton, originalButtonHTML);
    }
  };

  currentDownloadHandler = () => {
    const file = JSON.parse(downloadButton.dataset.file);

    downloadButton.disabled = true;

    // Start download
    window.location.href = `/files/${file.id}/download`;

    setTimeout(() => {
      downloadButton.disabled = false;
    }, BUTTON_DISABLED_DURATION);
  };

  // Add new listeners
  deleteButton.addEventListener('click', currentDeleteHandler);
  downloadButton.addEventListener('click', currentDownloadHandler);
}
