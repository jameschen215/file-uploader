import { hideModal, showModal } from '../../lib/modal-helpers.js';

export function confirmDeletion({ file = null, folder = null, user = null }) {
  // Return a new Promise. This is the key to making it asynchronous.
  return new Promise((resolve) => {
    const modal = document.querySelector('#confirm-modal');
    const negativeBtn = document.querySelector('#confirm-negative');
    const positiveBtn = document.querySelector('#confirm-positive');

    // If the modal or buttons don't exist, we can't proceed.
    // Resolve with 'false' to prevent the calling code from hanging.
    if (!modal || !negativeBtn || !positiveBtn) {
      console.error('Confirmation modal components not found!');
      return resolve(false);
    }

    // Show the modal
    showModal({ modal, file, folder, user });

    positiveBtn.addEventListener(
      'click',
      () => {
        hideModal({ modal });
        resolve(true);
      },
      { once: true },
    );

    negativeBtn.addEventListener(
      'click',
      () => {
        hideModal({ modal });
        resolve(false);
      },
      { once: true },
    );
  });
}

document.addEventListener('confirm-modal-open', (ev) => {
  const { file, folder, user } = ev.detail;
  const msgEl = document.querySelector('.confirm-message');

  if (file) {
    msgEl.textContent = `Are you sure to delete the file?`;
  }

  if (folder) {
    msgEl.textContent = `Are you sure to delete the folder?`;
  }

  if (user) {
    msgEl.textContent = `Are you sure to delete the account?`;
  }
});
