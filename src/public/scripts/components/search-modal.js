import { hideModal, showModal } from '../lib/modal-helpers.js';
import {
  handleActionsOnSearchedItems,
  handleClearButtonVisibility,
  updateSearchInfo,
} from '../lib/search-helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  const searchModal = document.querySelector('#search-modal');
  const searchModalTrigger = document.querySelector('.search-modal-trigger');
  const closeButton = document.querySelector('#search-modal .close-modal-btn');

  const form = document.querySelector('#search-modal .search-form');
  const spinner = document.querySelector('#search-indicator-mobile');
  const input = document.querySelector('#search-modal .search-form input');
  const clearButton = document.querySelector(
    '#search-modal .search-form button',
  );

  const counter = document.querySelector('#search-modal .results-counter');
  const container = document.querySelector('#search-results-for-mobile');

  let submitting = false;

  console.log('handle search on mobile');

  /** --- 1. Handle search modal show / hide --- */
  searchModalTrigger.addEventListener('click', () => {
    console.log('clicked');
    showModal({ modal: searchModal });
  });

  closeButton.addEventListener('click', () => {
    hideModal({ modal: searchModal });
  });

  /** --- 2. Initialize search state --- */
  document.addEventListener('search-modal-open', () => {
    // Register input actions
    handleClearButtonVisibility(input, clearButton);

    // Focus on input
    input.focus();

    // Update UI
    updateSearchInfo({ spinner, counter, container, submitting });
  });

  // Clear input after modal is hidden
  document.addEventListener('search-modal-hidden', () => {
    input.value = '';
  });

  /** --- 3. Handle search submission --- */
  form.addEventListener('submit', handleSubmission);

  /** --- 4. Handle actions on search result items --- */
  if (container) {
    container.addEventListener('click', handleActionsOnSearchedItems);
  }

  async function handleSubmission(ev) {
    ev.preventDefault();

    const query = input.value.trim();
    if (!query) return;

    try {
      submitting = true;
      updateSearchInfo({ spinner, counter, container, submitting });

      const url = `/search?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });

      if (!res.ok) {
        submitting = false;
        const error = `Failed to search ${query}`;
        updateSearchInfo({ spinner, counter, container, submitting, error });

        return;
      }

      const results = await res.json();

      console.log({ results });

      submitting = false;
      updateSearchInfo({ spinner, counter, container, submitting, results });
    } catch (error) {
      console.error('Error details:', error);

      submitting = false;
      updateSearchInfo({
        spinner,
        counter,
        container,
        submitting,
        error: error.message,
      });
    }
  }
});
