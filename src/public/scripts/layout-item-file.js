/** --- layout-item-file.js --- */

import { hideModal, showModal } from './lib/modal-helpers.js';

(function handleFileDetailsModalVisibility() {
  const triggers = document.querySelectorAll('.file-details-modal-trigger');
  const modal = document.querySelector('#file-details-modal');
  const closeButton = document.querySelector(
    '#file-details-modal .close-modal-btn',
  );

  if (!(triggers && modal && closeButton)) return;

  // Handle modal show / hide
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const file = JSON.parse(trigger.dataset.file);
      const breadcrumbs = JSON.parse(trigger.dataset.breadcrumbs);
      showModal({ modal, file, breadcrumbs });
    });
  });

  closeButton.addEventListener('click', () => {
    hideModal({ modal });
  });
})();
