import { hideModal, showModal } from '../../lib/modal-helpers.js';

(function handleSortModalVisibility() {
  const trigger = document.querySelector('.sort-modal-trigger');
  const modal = document.querySelector('#sort-modal');
  const closeButton = document.querySelector('#sort-modal .close-modal-btn');

  if (!trigger || !modal || !closeButton) return;

  trigger.addEventListener('click', () => {
    showModal({ modal });
  });

  closeButton.addEventListener('click', () => {
    hideModal({ modal });
  });

  // Hide when clicking outside modal content
  document.addEventListener('click', (ev) => {
    if (
      !ev.target.closest('#sort-modal > div') &&
      !ev.target.closest('.sort-modal-trigger')
    ) {
      hideModal({ modal });
    }
  });
})();

(function handleSortModalActions() {
  const form = document.querySelector('#sort-modal form');
  const submitButton = document.querySelector(
    '#sort-modal form button[type="submit"]',
  );

  if (!form || !submitButton) return;

  form.addEventListener('submit', () => {
    // disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Applying...';

    form.submit();
  });
})();
