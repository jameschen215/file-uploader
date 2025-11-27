import { icon } from './icons.js';
import {
  hideClearButton,
  showClearButton,
  showModal,
} from './modal-helpers.js';

export function generateSearchFile(file) {
  return `
    <div
      id="file-details-trigger-${file.id}"
      role="button"
      tabindex="0"
      data-file=${JSON.stringify(file)}
      class="file-details-modal-trigger item group w-full h-40 flex flex-col items-center justify-center gap-2 cursor-pointer group-hover:border-sky-200 dark:group-hover:border-sky-800 group-hover:bg-sky-50 dark:group-hover:bg-sky-950 transition-colors"
    >
      <div
        class="item-icon-wrapper w-full flex-grow flex items-center justify-center border rounded-md border-gray-200 dark:border-gray-800"
      >
        <span aria-hidden="true" class="item-icon block size-14 text-sky-400">
          ${getIcon(file.mimeType)}
        </span>
      </div>

      <div class="item-info relative w-full text-center">
        <span class="text-sm inline-block w-[calc(100%-24px)] mx-auto truncate">
          ${file.originalName}
        </span>
      </div>
    </div>
  `;
}

export function generateSearchFolder(folder) {
  return `
    <a
      href="/folders/${folder.id}"
      class="group w-full h-40 flex flex-col items-center justify-center gap-2 cursor-pointer"
    >

      <div
        class="group-focus:bg-sky-100 group-focus:dark:bg-sky-950 w-full flex-grow flex items-center justify-center border rounded-md border-gray-200 dark:border-gray-800"
      >
        <span aria-hidden="true" class="block text-sky-400">
         ${icon({ name: 'Folder', fill: 'currentColor', size: 56 })}
        </span>
      </div>

      <div class="item-info relative w-full text-center">
        <span class="text-sm inline-block w-[calc(100%-24px)] mx-auto truncate">
          ${folder.name}
        </span>
        <button
          id="folder-details-trigger-${folder.id}"
          type="button"
          aria-expanded="false"
          data-folder=${JSON.stringify(folder)}
          class="folder-details-modal-trigger item-info-btn absolute top-1/2 right-0 -translate-y-1/2 py-1 px-0.5 rounded-sm text-gray-500 sm:opacity-0 opacity-100 group-hover:opacity-100 hover:dark:bg-gray-800 hover:bg-gray-100 transition-all duration-200"
        >
          ${icon({ name: 'EllipsisVertical' })}
        </button>
      </div>
    </a>
  `;
}

let listenersAttached = false; // Track if listeners are already attached

export function handleClearButtonVisibility(input, button) {
  if (!input.value.trim()) {
    // Hide clear if no search value
    hideClearButton(button);
  } else {
    // Show it if search value exists
    showClearButton(button);
  }

  if (listenersAttached) {
    console.log('Listeners have been attached.');
    return;
  }

  listenersAttached = true;

  // Show the clear button on mousedown if the input has a value
  input.addEventListener('mousedown', () => {
    console.log('Mouse down');
    if (input.value.trim() !== '') {
      showClearButton(button);
    }
  });

  // Show the clear button while the user is typing (hide when input is empty)
  input.addEventListener('input', function () {
    if (this.value.trim() === '') {
      hideClearButton(button);
    } else {
      showClearButton(button);
    }
  });

  // Hide clear button when input loses focus and input is empty
  input.addEventListener('blur', () => {
    if (input.value.trim() === '') {
      hideClearButton(button);
    }
  });

  // Clear the input when clear button is clicked
  // a. Prevent the input from blurring when the clear button is clicked.
  // This allows the clear button's click event to fire.
  button.addEventListener('mousedown', (ev) => {
    ev.preventDefault();
  });

  // b. Show clear button when input isn't empty after loaded
  button.addEventListener('click', () => {
    input.value = '';
    input.focus();
    hideClearButton(button);
  });

  // Make the input blur when 'Escape' is pressed
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      input.blur();
    }
  });
}

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
        .map((folder) => generateSearchFolder(folder))
        .join('');

      const filesHTML = results.files
        .map((file) => generateSearchFile(file))
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
