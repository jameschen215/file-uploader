import { hideModal, showModal } from '../../lib/modal-helpers.js';
import { icon } from '../../lib/get-icon.js';
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_UPLOAD_FILES,
} from '../../lib/constants.js';
import { showToast } from '../toast.js';
import { addFileItemsToUI } from '../../lib/dom-helpers.js';
import { getUploadFileListItem } from '../../partials/upload-file-list-item-template.js';

const layoutContainer = document.querySelector('#layout-container');
const modal = document.querySelector('#upload-modal');
const triggers = document.querySelectorAll('.upload-modal-trigger');
const closeButton = document.querySelector('#upload-modal .close-modal-btn');

const dropzone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const selectedFilesDiv = document.getElementById('selected-files');
const fileCountSpan = document.getElementById('file-count');

const clearFilesBtn = document.getElementById('clear-files-btn');
const uploadForm = document.getElementById('upload-form');
const errorDiv = document.getElementById('upload-error');
const uploadProgress = document.getElementById('upload-progress');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');
const submitButton = document.querySelector('#upload-form button[type=submit]');

(function handleUploadModalVisibility() {
  if (!triggers || !modal || !closeButton) return;

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      showModal({ modal });
    });
  });

  closeButton.addEventListener('click', () => {
    hideModal({ modal });
  });
})();

(function handleUploadModalActions() {
  let selectedFiles = [];

  handleDropzoneActions();

  fileInput.addEventListener('change', (ev) => {
    handleFiles(ev.target.files);
  });

  clearFilesBtn.addEventListener('click', () => {
    selectedFiles = [];
    fileInput.value = '';
    errorDiv.innerHTML = '';
    errorDiv.classList.add('hidden');

    updateFilesDisplay();
  });

  uploadForm.addEventListener('submit', handleSubmitWithRealProgressBar);

  /** =============== Upload Handler =============== */
  async function handleSubmitWithRealProgressBar(ev) {
    ev.preventDefault();

    if (selectedFiles.length === 0) {
      showError("You haven't selected files.");
      return;
    }

    // 1. Set up submitting state
    setupSubmittingState();

    // 2. Create formData with selected files
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    // 3. Fetch with XMLHttpRequest
    const xhr = new XMLHttpRequest();

    // 4. Track upload progress
    xhr.upload.addEventListener('progress', (ev) => {
      if (ev.lengthComputable) {
        const percentComplete = (ev.loaded / ev.total) * 100;
        progressBar.style.width = percentComplete + '%';
        progressPercent.textContent = Math.round(percentComplete) + '%';
      }
    });

    // 5. Handle successful upload
    xhr.addEventListener('load', () => {
      const res = handleXHRResponse(xhr);

      if (res.ok && res.parsed) {
        // HTTP status is OK AND JSON parsed successfully
        // Now check if the operation itself was successful
        if (res.data.success) {
          // Everything succeeded
          progressBar.style.width = '100%';
          progressPercent.textContent = '100%';
          hideModal({ modal });

          addFileItemsToUI(layoutContainer, res.data.data.files);
          showToast(res.data.message, 'success');

          selectedFiles = [];
          updateFilesDisplay();
        } else {
          // HTTP OK, JSON valid, but operation failed
          showError(res.data.message || 'Upload failed');
        }

        cleanUpSubmittingState();
      } else if (res.ok && !res.parsed) {
        // HTTP OK but invalid JSON

        showError(res.error);
        cleanUpSubmittingState();
      } else {
        // HTTP error status
        const errorMessage = res.parsed
          ? res.data.message || res.data.error || 'Upload failed'
          : 'Upload failed';

        showError(errorMessage);
        cleanUpSubmittingState();
      }
    });

    // 6. Handle network errors
    xhr.addEventListener('error', () => {
      showError('Network error during upload');
      cleanUpSubmittingState();
    });

    // 7. Handle abort
    xhr.addEventListener('abort', () => {
      showError('Upload cancelled');
      cleanUpSubmittingState();
    });

    // 8. Set request method and route, and then send form data
    xhr.open('POST', uploadForm.action);
    xhr.send(formData);
  }

  function handleFiles(files) {
    errorDiv.classList.add('hidden');
    selectedFiles = [];

    for (const file of files) {
      if (selectedFiles.length >= MAX_UPLOAD_FILES) {
        showError(`Maximum ${MAX_UPLOAD_FILES} files allowed`);
        break;
      }

      console.log('File size: ', file.size);
      if (file.size > MAX_FILE_SIZE) {
        showError(
          `"${file.name}" exceeds ${MAX_FILE_SIZE / 1024 / 1024} MB limit`,
        );
        break;
      }

      if (!ALLOWED_FILE_TYPES.some((type) => file.type.startsWith(type))) {
        showError(`"${file.name}" is not a supported file type`);
        break;
      }

      selectedFiles.push(file);
    }

    updateFilesDisplay();
  }

  function updateFilesDisplay() {
    // 1. update file count
    fileCountSpan.textContent = selectedFiles.length;

    // 2. update file list
    if (selectedFiles.length === 0) {
      fileList.classList.add('hidden');
      selectedFilesDiv.innerHTML = '';
    } else {
      fileList.classList.remove('hidden');
      selectedFilesDiv.innerHTML = '';
      selectedFiles.forEach((file, index) =>
        selectedFilesDiv.appendChild(getUploadFileListItem(file, index)),
      );

      // 3. Attach event listener to clear buttons
      document.querySelectorAll('.clear-file-btn').forEach((btn) => {
        btn.addEventListener(
          'click',
          (ev) => {
            ev.stopPropagation();
            removeFile(btn.dataset.index);
          },
          { once: true },
        );
      });
    }
  }

  function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFilesDisplay();
  }

  function showError(message) {
    const errorP = errorDiv.querySelector('p');
    errorP.textContent = message;
    errorDiv.classList.remove('hidden');
  }

  function setupSubmittingState() {
    // Disable drop zone
    dropzone.classList.add(
      'opacity-50',
      'cursor-not-allowed',
      'pointer-events-none',
    );

    // Disable clear buttons
    clearFilesBtn.disabled = true;
    document.querySelectorAll('.clear-file-btn').forEach((btn) => {
      btn.disabled = true;
    });

    // Display progress bar
    uploadProgress.classList.remove('hidden');

    // Hide error message
    errorDiv.classList.add('hidden');

    // Update submit button
    submitButton.textContent = 'Uploading...';
    submitButton.disabled = true;
  }

  function cleanUpSubmittingState() {
    // Enable drop zone
    dropzone.classList.remove(
      'opacity-50',
      'cursor-not-allowed',
      'pointer-events-none',
    );

    // Enable clear buttons
    clearFilesBtn.disabled = false;
    document.querySelectorAll('.clear-file-btn').forEach((btn) => {
      btn.disabled = false;
    });

    // Show progress bar
    uploadProgress.classList.add('hidden');

    // Update submit button
    submitButton.textContent = 'Upload';
    submitButton.disabled = false;
  }

  function handleDropzoneActions() {
    // Drag and drop
    dropzone.addEventListener('dragover', (ev) => {
      ev.preventDefault();

      dropzone.classList.add(
        'border-blue-400',
        'bg-blue-50',
        'dark:border-blue-600',
        'dark:bg-blue-950',
      );
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove(
        'border-blue-400',
        'bg-blue-50',
        'dark:border-blue-600',
        'dark:bg-blue-950',
      );
    });

    dropzone.addEventListener('drop', (ev) => {
      ev.preventDefault();

      dropzone.classList.remove(
        'border-blue-400',
        'bg-blue-50',
        'dark:border-blue-600',
        'dark:bg-blue-950',
      );
      handleFiles(ev.dataTransfer.files);
    });
  }
})();

/** ======================== XHR Utilities ======================== */

function parseXHRResponse(xhr) {
  // Check if there's response text
  if (!xhr.responseText) {
    return { parsed: false, error: 'Empty response from server.' };
  }

  try {
    const data = JSON.parse(xhr.responseText);
    return { parsed: true, data };
  } catch (error) {
    console.log('Caught');
    return {
      parsed: false,
      error: 'Invalid JSON response.',
    };
  }
}

function handleXHRResponse(xhr) {
  const result = parseXHRResponse(xhr);

  return {
    ok: xhr.status >= 200 && xhr.status < 300,
    status: xhr.status,
    parsed: result.parsed,
    data: result.data || null,
    error: result.error || null,
  };
}
