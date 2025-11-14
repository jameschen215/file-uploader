import { icon } from './lib/icons.js';
import { hideModal, showModal } from './lib/modal-helpers.js';
import { formatTime } from './lib/utils.js';

const BUTTON_DISABLED_DURATION = 3000;

// Store handler references outside the function
let currentDownloadHandler = null;
let currentDeleteHandler = null;
let currentShareHandler = null;

(function handleFileDetailsModalVisibility() {
  const triggers = document.querySelectorAll('[id^="file-details-trigger"]');
  const modal = document.querySelector('#file-details-modal');
  const closeButton = document.querySelector(
    '#file-details-modal .close-modal-btn',
  );

  if (!(triggers && modal && closeButton)) return;

  // Handle modal show / hide
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      showModal(modal, trigger);
    });
  });

  closeButton.addEventListener('click', () => {
    triggers.forEach((trigger) => {
      hideModal(modal, trigger);
    });
  });
})();

(function handleFileDetailsModalActions() {
  document.addEventListener('file-details-modal-open', (ev) => {
    console.log('Handling details display...');

    const { file, breadcrumbs } = ev.detail;

    if (!(file && breadcrumbs)) return;

    displayFileInfo(file, breadcrumbs);
    addEventHandlers(file);
  });

  function displayFileInfo(file, breadcrumbs) {
    document.querySelector('#detail-name').textContent = file.originalName;
    document.querySelector('#detail-size').textContent = file.fileSize;
    document.querySelector('#detail-date').textContent = file.uploadedAt;

    let fileType = '';
    if (file.mimeType.startsWith('image')) {
      fileType = file.mimeType.split('/')[1].toUpperCase() + ' Image';
    } else if (file.mimeType.startsWith('video')) {
      fileType = file.mimeType.split('/')[1].toUpperCase() + ' Video';
    } else {
      fileType = file.mimeType.split('/')[1].toUpperCase() + ' File';
    }

    document.querySelector('#detail-type').textContent = fileType;

    document.querySelector('#detail-path').innerHTML =
      breadcrumbs.length > 0
        ? `Cloud drive &#x203A; ${breadcrumbs.map((bc) => bc.name).join(` &#x203A; `)}`
        : `Cloud drive`;

    // Show thumbnail for images and videos
    const previewDiv = document.querySelector('#detail-preview');
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
      previewDiv.innerHTML = icon({
        name: 'File',
        size: 144,
        strokeWidth: 1,
        className: 'text-gray-500',
      });
    }

    // Show resolution if available
    const resolutionContainer = document.getElementById(
      'modal-resolution-container',
    );
    const resolutionEl = document.getElementById('detail-resolution');

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
    const durationContainer = document.getElementById(
      'modal-duration-container',
    );
    const durationEl = document.getElementById('detail-duration');

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

  function addEventHandlers(file) {
    // Handlers
    const deleteButton = document.querySelector('#delete-btn');
    const shareButton = document.querySelector('#share-btn');
    const downloadButton = document.querySelector('#download-btn');

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
        deleteButton.disabled = true;
        deleteButton.textContent = 'Deleting...';

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
      } finally {
        deleteButton.disabled = false;
        deleteButton.textContent = 'Delete';
      }
    };

    currentShareHandler = () => {
      console.log(`Sharing ${file.originalName}...`);
    };

    currentDownloadHandler = () => {
      console.log(`Downloading ${file.originalName}...`);

      // Disable the button and show loading text
      downloadButton.disabled = true;
      downloadButton.textContent = 'Downloading...';

      // Start download
      window.location.href = `files/${file.id}/download`;

      // Re-enable after a short delay
      setTimeout(() => {
        downloadButton.disabled = true;
        downloadButton.textContent = 'Download';
      }, BUTTON_DISABLED_DURATION);
    };

    // Add new listeners
    deleteButton.addEventListener('click', currentDeleteHandler);
    shareButton.addEventListener('click', currentShareHandler);
    downloadButton.addEventListener('click', currentDownloadHandler);
  }
})();
