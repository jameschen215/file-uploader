import { icon } from './icons.js';
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_UPLOAD_FILES,
} from './constants.js';

export function handleUploadInput() {
  const dropzone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  const selectedFilesDiv = document.getElementById('selected-files');
  const fileCountSpan = document.getElementById('file-count');
  const uploadCountSpan = document.getElementById('upload-count');
  const submitBtn = document.getElementById('submit-btn');
  const clearFilesBtn = document.getElementById('clear-files-btn');
  const uploadForm = document.getElementById('upload-form');
  const errorDiv = document.getElementById('upload-error');
  const uploadProgress = document.getElementById('upload-progress');
  const progressBar = document.getElementById('progress-bar');
  const progressPercent = document.getElementById('progress-percent');

  let selectedFiles = [];

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

  fileInput.addEventListener('change', (ev) => {
    handleFiles(ev.target.files);
  });

  clearFilesBtn.addEventListener('click', () => {
    selectedFiles = [];
    fileInput.value = '';

    updateFileDisplay();
  });

  // Form submission with progress
  uploadForm.addEventListener('submit', handleSubmitWithRealProgressBar);

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

    updateFileDisplay();
  }

  function updateFileDisplay() {
    fileCountSpan.textContent = selectedFiles.length;
    uploadCountSpan.textContent =
      selectedFiles.length > 0 ? ` (${selectedFiles.length})` : '';
    submitBtn.disabled = selectedFiles.length === 0;

    if (selectedFiles.length === 0) {
      fileList.classList.add('hidden');
      selectedFilesDiv.innerHTML = '';
    } else {
      fileList.classList.remove('hidden');
      selectedFilesDiv.innerHTML = selectedFiles
        .map(
          (file, index) => `
        <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 group">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <div class="text-xl">
                  ${file.type.startsWith('image/') ? icon({ name: 'Image', size: 28, strokeWidth: 1.5 }) : file.type.startsWith('video/') ? icon({ name: 'Film', size: 28, strokeWidth: 1.5 }) : icon({ name: 'File', size: 28, strokeWidth: 1.5 })}
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-gray-900 dark:text-gray-50 line-clamp-1">
                    ${file.name}
                  </p>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400">
                    ${(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <button
                type="button"
                data-index="${index}"
                class="clear-file-btn opacity-100 sm:opacity-0 group-hover:opacity-100 p-1 text-red-600 bg-red-100 dark:text-red-100 dark:bg-red-800 rounded transition-all"
              >
                ${icon({ name: 'X', size: 16 })}
              </button>
            </div>
      `,
        )
        .join('');

      // Remove single file
      document.querySelectorAll('.clear-file-btn').forEach((btn) => {
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();

          removeFile(btn.dataset.index);
        });
      });
    }
  }

  function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileDisplay();
  }

  function showError(message) {
    const errorP = errorDiv.querySelector('p');
    errorP.textContent = message;
    errorDiv.classList.remove('hidden');
  }

  // Submit handler with real-time progress tracking
  async function handleSubmitWithRealProgressBar(ev) {
    ev.preventDefault();

    if (selectedFiles.length === 0) return;

    console.log('File count: ', selectedFiles.length);

    // Create formData with selected files
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    console.log({ formData });

    submitBtn.disabled = true;
    uploadProgress.classList.remove('hidden');
    errorDiv.classList.add('hidden');

    // Fetch with XMLHttpRequest
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (ev) => {
      if (ev.lengthComputable) {
        const percentComplete = (ev.loaded / ev.total) * 100;
        progressBar.style.width = percentComplete + '%';
        progressPercent.textContent = Math.round(percentComplete) + '%';
      }
    });

    // Handle successful upload
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Show 100% briefly before reload
        progressBar.style.width = '100%';
        progressPercent.textContent = '100%';

        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        // Handle error response
        try {
          const data = JSON.parse(xhr.responseText);
          console.log('Error: ', data.error);
          showError(data.error || 'Upload failed');
        } catch (error) {
          console.log('Error: ', error.message);
          showError(error.message || 'Upload failed');
        }

        uploadProgress.classList.add('hidden');
        submitBtn.disabled = false;
      }
    });

    // Handle network errors
    xhr.addEventListener('error', () => {
      showError('Network error during upload');

      uploadProgress.classList.add('hidden');
      submitBtn.disabled = false;
    });

    // Handle abort
    xhr.addEventListener('abort', () => {
      showError('Upload cancelled');

      uploadProgress.classList.add('hidden');
      submitBtn.disabled = false;
    });

    // Set request method and route
    xhr.open('POST', uploadForm.action);

    // Send the request
    xhr.send(formData);
  }

  // Deprecated submit handler
  async function handleSubmitWithFakeProgressBar(ev) {
    ev.preventDefault();

    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    submitBtn.disabled = true;
    uploadProgress.classList.remove('hidden');
    errorDiv.classList.add('hidden');

    try {
      const response = await fetch(uploadForm.action, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        progressBar.style.width = '100%';
        progressPercent.textContent = '100%';

        setTimeout(() => {
          window.location.reload();
        }, 100); // Small delay so user sees the 100%
      } else {
        showError(data.error || 'Upload failed');
        uploadProgress.classList.add('hidden');
        submitBtn.disabled = false;
      }
    } catch (error) {
      showError(error.message || 'Network error during upload');
      uploadProgress.classList.add('hidden');
      submitBtn.disabled = false;
    }
  }
}
