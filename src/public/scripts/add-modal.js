import { hideModal, showModal } from './lib/modal-helpers.js';

(function handleAddModalVisibility() {
  const trigger = document.querySelector('#add-btn-for-mobile');
  const modal = document.querySelector('#add-modal');
  const closeButton = document.querySelector('#add-modal .close-modal-btn');

  if (!trigger || !modal || !closeButton) return;

  trigger.addEventListener('click', () => {
    showModal(modal, trigger);
  });

  closeButton.addEventListener('click', () => {
    hideModal(modal, trigger);
  });

  // Hide when clicking outside modal content
  document.addEventListener('click', (ev) => {
    if (
      !ev.target.closest('#add-modal > div') &&
      !ev.target.closest('#add-btn-for-mobile')
    ) {
      hideModal(modal, trigger);
    }
  });
})();

// (function handleAddModalActions() {
//   const createFolderButton = document.querySelector('#folder-btn-for-mobile');
//   const uploadFilesButton = document.querySelector('#upload-btn-for-mobile');

//   if (!createFolderButton || !uploadFilesButton) return;

//   createFolderButton.addEventListener('click', () => {
//     showModal()
//   })
// })();
