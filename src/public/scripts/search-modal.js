import {
  hideModal,
  showModal,
  hideClearButton,
  showClearButton,
} from './lib/modal-helpers.js';
import { generateSearchItem } from './lib/search-helpers.js';

const fileDetailsModal = document.querySelector('#file-details-modal');

const searchModalTrigger = document.querySelector('.search-modal-trigger');
const searchModal = document.querySelector('#search-modal');
const resultsContainer = document.querySelector('#search-results-for-mobile');
const closeButton = document.querySelector('#search-modal .close-modal-btn');

const form = document.querySelector('#search-modal .search-form');
const input = document.querySelector('#search-modal .search-form input');
const clearButton = document.querySelector(
  '#search-modal .search-form button[type="button"]',
);

/** --- 1. Handle search modal show / hide --- */

(function handleSearchModalVisibility() {
  if (!searchModalTrigger || !searchModal || !closeButton) return;

  searchModalTrigger.addEventListener('click', () => {
    showModal({ modal: searchModal });
  });

  closeButton.addEventListener('click', () => {
    hideModal({ modal: searchModal });
  });
})();

/** --- 2. Handle actions on search modal --- */
(function handleSearchModalActions() {
  if (!form || !input || !clearButton) return;

  // 1. Hide clear button on load
  hideClearButton(clearButton);

  // 2. Focus on search input, and clear result container after showing
  document.addEventListener('search-modal-open', () => {
    input.focus();
    resultsContainer.innerHTML = `<span class="mt-10 text-4xl">🧐</span>`;
  });

  // 3. Handle clear button visibility when typing on input
  // 3.1 Show it on mousedown if the input has a value
  input.addEventListener('mousedown', () => {
    if (input.value.trim() !== '') {
      showClearButton(clearButton);
    }
  });

  // 3.2 Show it while on input but hide it when the input value is empty
  input.addEventListener('input', function () {
    if (this.value.trim() === '') {
      hideClearButton(clearButton);
    } else {
      showClearButton(clearButton);
    }
  });

  // 3.2 Hide it when input loses focus
  input.addEventListener('blur', function () {
    if (this.value.trim() === '') {
      hideClearButton(clearButton);
      resultsContainer.innerHTML = `<span class="mt-10 text-4xl">🧐</span>`;
    }
  });

  // 4. Clear input value
  // 4.1 Prevent input form blurring when the clear button is clicked
  //  This allows the clear button's click event to fire.
  clearButton.addEventListener('mousedown', (ev) => ev.preventDefault());

  // 4.2 Clear it when clear button is clicked
  clearButton.addEventListener('click', function () {
    input.value = '';
    input.focus();
    hideClearButton(this);
  });

  // 4.3 Clear it when the modal is hidden
  document.addEventListener('search-modal-hidden', () => {
    input.value = '';
  });

  // 5. Make input blur when 'Escape' is pressed
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      ev.preventDefault();

      input.blur();
    }
  });

  // 6. Submit search form
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const query = input.value.trim();

    resultsContainer.innerHTML = `
      <li class="mt-10 flex items-center gap-2">
        <span class="text-4xl">🧐</span>
        <span class="text-lg">Searching...</span>
      </li>
    `;

    try {
      const url = `/search?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);

      const { files } = await res.json();
      console.log({ files });

      if (files.length === 0) {
        resultsContainer.innerHTML = `<li>No results found.</li>`;
        return;
      }

      resultsContainer.innerHTML = files
        .map((file) => generateSearchItem(file))
        .join('');
    } catch (error) {
      console.error('Error details:', error);
      resultsContainer.innerHTML =
        '<li class="text-red-500">Error searching files</li>';
    }
  });
})();

/** --- 3. Handle actions on search result items --- */

(function handleActionsOnResultItems() {
  resultsContainer.addEventListener('click', (ev) => {
    // Find the closest .file-details-modal-trigger that was clicked
    const fileDetailsModalTrigger = ev.target.closest(
      '.file-details-modal-trigger',
    );

    if (!fileDetailsModalTrigger) return;

    const file = JSON.parse(fileDetailsModalTrigger.dataset.file);
    const breadcrumbs = JSON.parse(fileDetailsModalTrigger.dataset.breadcrumbs);

    showModal({ modal: fileDetailsModal, file, breadcrumbs });
  });
})();
