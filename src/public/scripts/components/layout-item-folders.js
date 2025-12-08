import { hideModal, showModal } from '../lib/modal-helpers.js';

// Handle folder click
document.querySelectorAll('a[href^="/folders/"]').forEach((folderLink) => {
  folderLink.addEventListener('click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    window.location.href = folderLink.href;
  });
});

(function handleFolderDetailsModalVisibility() {
  const layoutContainer = document.querySelector('#layout-container');
  const modal = document.querySelector('#folder-details-modal');
  const closeButton = document.querySelector(
    '#folder-details-modal .close-modal-btn',
  );

  if (!(layoutContainer && modal && closeButton)) return;

  // Handle modal show / hide
  layoutContainer.addEventListener(
    'click',
    (ev) => {
      // Look for the closest element with the trigger selector
      const trigger = ev.target.closest('.folder-details-modal-trigger');

      // Not a trigger → allow normal behavior
      if (!trigger) return;

      ev.preventDefault();
      ev.stopPropagation();

      const folder = JSON.parse(trigger.dataset.folder);
      const breadcrumbs = JSON.parse(trigger.dataset.breadcrumbs);

      showModal({ modal, folder, breadcrumbs });
    },
    true, // capturing phase
  );

  closeButton.addEventListener('click', () => {
    hideModal({ modal });
  });
})();
