import { showToast } from '../toast.js';
import { icon } from '../../lib/get-icon.js';
import { confirmDeletion } from './confirm-modal.js';
import { loadImageWithSpinner } from '../../lib/dom-helpers.js';
import { formateDate, formatFileSize, formatTime } from '../../lib/utils.js';
import { hideModal, showModal } from '../../lib/modal-helpers.js';

const BUTTON_DISABLED_DURATION = 1000;

// Store handler references outside the function
let currentDownloadHandler = null;
let currentDeleteHandler = null;

const fileDetailsModal = document.querySelector('#file-details-modal');

console.log('file details modal');

document.addEventListener('file-details-modal-open', (ev) => {
  console.log('Handling details display...');

  const { file, breadcrumbs } = ev.detail;

  if (!(file && breadcrumbs)) return;

  displayFileInfo(file, breadcrumbs);
  addFileActions(file);
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
}

function addFileActions(file) {
  // Handlers
  const shareButton = document.querySelector('#share-file-btn');
  const downloadButton = document.querySelector('#download-file-btn');
  const deleteButton = document.querySelector('#delete-file-btn');

  // Attach file to share button dataset
  shareButton.dataset.file = JSON.stringify(file);

  // Remove old listeners if they exist
  if (currentDeleteHandler) {
    deleteButton.removeEventListener('click', currentDeleteHandler);
  }

  if (currentDownloadHandler) {
    downloadButton.removeEventListener('click', currentDownloadHandler);
  }

  // Create new handlers with the current file data
  currentDeleteHandler = async () => {
    const confirmed = await confirmDeletion({ file });

    if (!confirmed) return;

    console.log(`Deleting ${file.originalName}...`);

    // Store reference to the element and its position BEFORE removing
    const fileItemEl = document.querySelector(
      `#file-details-trigger-${file.id}`,
    );
    let parentEl = null;
    let previousEl = null;

    if (fileItemEl) {
      // Store the parent and previous sibling for restoration
      parentEl = fileItemEl.parentElement;
      previousEl = fileItemEl.previousElementSibling;
    }

    try {
      deleteButton.disabled = true;

      // 1. Remove element from UI optimistically and hide file details modal
      if (fileItemEl) {
        // Show toast first
        showToast('Deleting file...', 'info');
        fileItemEl.remove();
        hideModal({ modal: fileDetailsModal });
      }

      // 2. Request the server to remove the file
      const res = await fetch(`/files/${file.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();

        // RESTORE THE ELEMENT and re-open file details modal on failure
        if (fileItemEl && parentEl) {
          if (previousEl) {
            // Insert after the previous sibling
            previousEl.after(fileItemEl);
          } else {
            // It was the first child, prepend it
            parentEl.prepend(fileItemEl);
          }

          showModal({ modal: fileDetailsModal, file });
        }

        showToast(errorData.message, 'error');
        return;
      }

      const result = await res.json();

      // Show toast first
      showToast(result.message, 'success');
    } catch (error) {
      console.error('Delete error:', error);

      // RESTORE THE ELEMENT and re-open file details modal on failure
      if (fileItemEl && parentEl) {
        if (previousEl) {
          previousEl.after(fileItemEl);
        } else {
          parentEl.prepend(fileItemEl);
        }

        showModal({ modal: fileDetailsModal, file });
      }

      showToast(error.message || 'Failed to delete the file', 'error');
    } finally {
      deleteButton.disabled = false;
    }
  };

  currentDownloadHandler = () => {
    console.log(`Downloading ${file.originalName}...`);

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
