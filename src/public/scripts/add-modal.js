import { hideModal, showModal } from './lib/modal-helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  (function handleAddModal() {
    const addButton = document.querySelector('#add-modal-btn');
    const addModal = document.querySelector('#add-modal');

    if (!addButton || !addModal) return;

    let isHidden = true;

    // Toggle sort modal when users clicking on add button
    addButton.addEventListener('click', () => {
      if (isHidden) {
        isHidden = showModal('add-modal');
      } else {
        isHidden = hideModal('add-modal');
      }
    });

    // Close modal when user clicking on x
    addModal.querySelector('#close-add-modal').addEventListener('click', () => {
      isHidden = hideModal('add-modal');
    });

    // Close addModal when user clicking outside it
    document.addEventListener('click', (ev) => {
      if (
        !ev.target.closest('#add-modal > div') &&
        !ev.target.closest('#add-btn')
      ) {
        isHidden = hideModal('add-modal');
      }
    });

    // Close modal when user pressing 'Esc' key
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();

        isHidden = hideModal('add-modal');
      }
    });

    // Close modal when user clicking on options
    // document.querySelectorAll('#add-modal ul li').forEach((li) => {
    //   li.addEventListener('click', () => {
    //     isHidden = hideModal('add');
    //   });
    // });
  })();
});
