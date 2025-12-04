import {
  generateFileItem,
  generateFolderItem,
} from '../components/layout-item.js';
import {
  hideClearButton,
  showClearButton,
  showModal,
} from './modal-helpers.js';
import { icon } from './get-icon.js';

export function handleActionsOnSearchedItems(ev) {
  const fileDetailsModal = document.querySelector('#file-details-modal');
  const folderDetailsModal = document.querySelector('#folder-details-modal');

  const fileDetailsModalTrigger = ev.target.closest(
    '.file-details-modal-trigger',
  );
  const folderDetailsModalTrigger = ev.target.closest(
    '.folder-details-modal-trigger',
  );

  if (fileDetailsModalTrigger) {
    const file = JSON.parse(fileDetailsModalTrigger.dataset.file);

    showModal({ modal: fileDetailsModal, file, breadcrumbs: file.breadcrumbs });
  } else if (folderDetailsModalTrigger) {
    ev.preventDefault();
    ev.stopPropagation();

    const folder = JSON.parse(folderDetailsModalTrigger.dataset.folder);

    showModal({
      modal: folderDetailsModal,
      folder,
      breadcrumbs: folder.breadcrumbs,
    });
  }

  return;
}

export function attackClearButtonListeners(input, button) {
  if (!input || !button) return;

  // Show the clear button on mousedown if the input has a value
  input.addEventListener('mousedown', function () {
    if (this.value.trim() !== '') {
      showClearButton(button);
    }
  });

  input.addEventListener('input', function () {
    if (this.value.trim() === '') {
      hideClearButton(button);
    } else {
      showClearButton(button);
    }
  });

  // Hide clear button when input loses focus and input is empty
  input.addEventListener('blur', function () {
    if (this.value.trim() === '') {
      hideClearButton(button);
    }
  });

  // Clear the input when clear button is clicked
  // a. Prevent the input from blurring when the clear button is clicked.
  // This allows the clear button's click event to fire.
  button.addEventListener('mousedown', function (ev) {
    ev.preventDefault();
  });

  // b. Show clear button when input isn't empty after loaded
  button.addEventListener('click', function () {
    input.value = '';
    input.focus();
    hideClearButton(this);
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      input.blur();
    }
  });
}

export function updateClearButtonVisibility(input, button) {
  if (!input || !button) return;

  if (input.value.trim()) {
    showClearButton(button);
  } else {
    hideClearButton(button);
  }
}

export function updateSearchInfo({
  spinner,
  container,
  counter,
  submitting,
  error = null,
  results = null,
}) {
  counter.innerHTML = '';

  if (submitting) {
    spinner.innerHTML = icon({
      name: 'LoaderCircle',
      className: 'animate-spin',
    });

    container.innerHTML = `
      <div class="mt-10 flex items-center justify-center gap-2 col-span-full">
        <span class="text-3xl">🧐</span>
        <span class="text-base">Searching...</span>
      </div>
    `;
  } else {
    spinner.innerHTML = icon({ name: 'Search' });

    if (error) {
      container.innerHTML = `<div>${error}</div>`;
    } else if (!results) {
      container.innerHTML = `<div class="col-span-full text-center mt-10"><span class="text-3xl">🧐</span></div>`;
    } else if (results.files.length === 0 && results.folders.length === 0) {
      counter.innerHTML = '0 results';
      container.innerHTML = `<div class="mt-10 col-span-full text-center">No results found.</div>`;
    } else {
      const foldersHTML = results.folders
        .map((folder) => generateFolderItem(folder))
        .join('');

      const filesHTML = results.files
        .map((file) => generateFileItem(file))
        .join('');

      counter.innerHTML = getResultsCount(results);
      container.innerHTML = foldersHTML + filesHTML;
    }
  }
}

function getResultsCount(results) {
  const count = results.files.length + results.folders.length;

  return `${count} ${count === 1 ? 'result' : 'results'}`;
}

function getIcon(type) {
  if (type.startsWith('image')) {
    return icon({
      name: 'Image',
      strokeWidth: 1,
      className: 'w-full h-auto',
    });
  } else if (type.startsWith('video')) {
    return icon({ name: 'Film', strokeWidth: 1, className: 'w-full h-auto' });
  }

  return icon({ name: 'File', strokeWidth: 1, className: 'w-full h-auto' });
}
