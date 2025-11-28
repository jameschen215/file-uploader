import { icon } from './lib/get-icon.js';
import { hideModal, showModal } from './lib/modal-helpers.js';
import { formateDate, formatFileSize, formatTime } from './lib/utils.js';

const BUTTON_DISABLED_DURATION = 500;

// Store handler references outside the function
let currentDownloadHandler = null;
let currentDeleteHandler = null;
let currentShareHandler = null;

document.addEventListener('file-details-modal-open', (ev) => {
  console.log('Handling details display...');

  const { file, breadcrumbs } = ev.detail;

  if (!(file && breadcrumbs)) return;

  displayFileInfo(file, breadcrumbs);
  addFileActionHandlers(file);
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
      ? `<a href="/" class="font-medium text-sky-500">Cloud drive</a>`
      : `<a href="/" class="font-medium text-sky-500">Cloud drive</a> &#x203A; ` +
        breadcrumbs
          .map(
            (bc) =>
              `<a href="/folders/${bc.id}" class="font-medium text-sky-500">${bc.name}</a>`,
          )
          .join(' &#x203A; ');

  // Show thumbnail for images and videos
  const previewDiv = document.querySelector('#file-preview');
  if (file.mimeType.startsWith('image')) {
    // previewDiv.innerHTML = `
    //     <div class="flex items-center justify-center">
    //       <img src="/files/${file.id}/thumbnail" alt="File preview" />
    //     </div>
    //   `;
    previewDiv.innerHTML = `
        <div class="flex items-center justify-center">
          <img
            src="/files/${file.id}/preview"
            alt="${file.originalName}"
          />
        </div>
      `;
  } else if (file.mimeType.startsWith('video')) {
    // previewDiv.innerHTML = `
    //     <div class="relative flex items-center justify-center">
    //       <img src="${file.parentFolderId || ''}/files/${file.id}/thumbnail" alt="File preview" />
    //       <div class="absolute top-0 left-0 size-full bg-gray-700 opacity-25"></div>
    //       <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-200">
    //         ${icon({ name: 'Play', size: 32, fill: 'currentColor' })}
    //       </div>
    //     </div>
    //   `;
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
}

function addFileActionHandlers(file) {
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
      deleteButton.disabled = true;

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
    }
  };

  currentShareHandler = async () => {
    console.log(`Handle share link...`);

    const detailsModal = document.querySelector('#file-details-modal');
    const shareModal = document.querySelector('#share-modal');

    // Close current modal
    hideModal({ modal: detailsModal });

    // Then open share modal
    setTimeout(() => {
      showModal({ modal: shareModal, file });
    }, 100);
  };

  currentDownloadHandler = () => {
    console.log(`Downloading ${file.originalName}...`);
    const modal = document.querySelector('#file-details-modal');

    downloadButton.disabled = true;

    // Start download
    window.location.href = `/files/${file.id}/download`;

    setTimeout(() => {
      hideModal({ modal });
    }, BUTTON_DISABLED_DURATION);
  };

  // Add new listeners
  deleteButton.addEventListener('click', currentDeleteHandler);
  shareButton.addEventListener('click', currentShareHandler);
  downloadButton.addEventListener('click', currentDownloadHandler);
}
