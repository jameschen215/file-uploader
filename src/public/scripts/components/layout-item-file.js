/** --- layout-item-file.js --- */

import { hideModal, showModal } from '../lib/modal-helpers.js';

(function handleFileDetailsModalVisibility() {
  const layoutContainer = document.querySelector('#layout-container');
  const modal = document.querySelector('#file-details-modal');
  const closeButton = document.querySelector(
    '#file-details-modal .close-modal-btn',
  );

  if (!(layoutContainer && modal && closeButton)) return;

  // Handle modal show / hide
  layoutContainer.addEventListener('click', (ev) => {
    // Look for the closest element with the trigger selector
    const trigger = ev.target.closest('.file-details-modal-trigger');

    if (!trigger) return;

    const file = JSON.parse(trigger.dataset.file);
    const breadcrumbs = JSON.parse(trigger.dataset.breadcrumbs) || [];

    console.log({ file, breadcrumbs });

    showModal({ modal, file, breadcrumbs });
  });

  closeButton.addEventListener('click', () => {
    hideModal({ modal });
  });
})();
