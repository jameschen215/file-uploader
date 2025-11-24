import { hideModal, showModal } from './lib/modal-helpers.js';

// Handle folder click
document.querySelectorAll('a[href^="/folders/"]').forEach((folderLink) => {
  folderLink.addEventListener('click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    window.location.href = folderLink.href;
  });
});

(function handleFolderDetailsModalVisibility() {
  const triggers = document.querySelectorAll('.folder-details-modal-trigger');
  const modal = document.querySelector('#folder-details-modal');
  const closeButton = document.querySelector(
    '#folder-details-modal .close-modal-btn',
  );

  if (!(triggers && modal && closeButton)) return;

  // Handle modal show / hide
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      const folder = JSON.parse(trigger.dataset.folder);
      const breadcrumbs = JSON.parse(trigger.dataset.breadcrumbs);

      showModal({ modal, folder, breadcrumbs });
    });
  });

  closeButton.addEventListener('click', () => {
    hideModal({ modal });
  });

  // Close when clicking outside the modal
  document.addEventListener('click', (ev) => {
    if (
      !ev.target.closest('#folder-details-modal > div') &&
      !ev.target.closest('[id^="folder-details-trigger"]')
    ) {
      hideModal({ modal });
    }
  });
})();
