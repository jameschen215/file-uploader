import { handleSortInput } from './lib/sort-helpers.js';
import { handleSearchInput } from './lib/search-helpers.js';
import { handleAddInput } from './lib/add-helpers.js';
import { handleFolderInput } from './lib/folder-helpers.js';
import { showModal, hideModal } from './lib/modal-helpers.js';
import { handleUploadInput } from './lib/upload-helpers.js';
import { handleShowFileInfo } from './lib/file-info-helpers.js';

// Handle modal show/hide
(function handleModalVisibility() {
  const modal = document.getElementById('modal');

  let isHidden = true;

  // 1. Show modal with correct content
  document.querySelectorAll('.modal-trigger').forEach((trigger) => {
    trigger.addEventListener('click', (ev) => {
      ev.stopPropagation();

      const modalName = trigger.id.split('-')[0];
      console.log({ modalName });

      if (isHidden) {
        switch (modalName) {
          case 'add':
            isHidden = showModal(
              modal,
              trigger,
              modalName,
              'Upload files or create folders',
            );
            break;
          case 'sort':
            isHidden = showModal(
              modal,
              trigger,
              modalName,
              'Select a way to sort the content',
            );
            break;
          case 'search':
            isHidden = showModal(
              modal,
              trigger,
              modalName,
              'Search for folders and files',
            );
            break;
          case 'folder':
            isHidden = showModal(
              modal,
              trigger,
              modalName,
              'Create new folder',
            );
            break;
          case 'upload':
            isHidden = showModal(modal, trigger, modalName, 'Upload files');
            break;
          case 'file':
            modal.setAttribute('', trigger.dataset.file);
            isHidden = showModal(modal, trigger, modalName, 'File details');
            break;
        }
      }
    });
  });

  // 2. Hide modal
  document.addEventListener('modal-open', () => {
    // 2.1 hide when clicking on close button
    modal.querySelectorAll('.close-modal-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        isHidden = hideModal(modal);
      });
    });

    // 2.2 hide when clicking outside modal content
    document.addEventListener('click', (ev) => {
      if (
        !ev.target.closest('[id$="in-modal"]') &&
        !ev.target.closest('.modal-trigger')
      ) {
        isHidden = hideModal(modal);
      }
    });

    // 2.3 On add modal
    document.querySelectorAll('[id$="btn-for-mobile"]').forEach((btn) => {
      if (btn) {
        btn.addEventListener('click', () => {
          isHidden = hideModal(modal);

          const modalName = btn.id.split('-')[0];

          // then after add modal hidden, re-open the modal with folder form
          setTimeout(() => {
            isHidden = showModal(
              modal,
              btn,
              modalName,
              modalName === 'upload' ? 'Upload files' : 'Create new folder',
            );
          }, 50);
        });
      }
    });

    // 2.4 hide on form submit
    // modal.querySelector('form').addEventListener('submit', function (ev) {
    //   ev.preventDefault();

    //   // isHidden = hideModal(modal);

    //   this.submit();
    // });

    // 2.5 hide on pressing 'Escape'
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();

        isHidden = hideModal(modal);
      }
    });
  });
})();

// Track which handlers have been initialized
const initializedHandlers = new Set();

// Handle actions in modals
(function handleModalActions() {
  document.addEventListener('modal-open', () => {
    const modal = document.querySelector('#modal');

    if (!modal) return;

    const content = modal.querySelector(':scope > div.flex');

    const contentName = content.id.split('-')[0];

    switch (contentName) {
      // case 'add':
      //   handleAddInput();
      //   break;
      case 'sort':
        if (!initializedHandlers.has('sort')) {
          handleSortInput();
          initializedHandlers.add('sort');
        }
        break;
      case 'search':
        if (!initializedHandlers.has('search')) {
          handleSearchInput();
          initializedHandlers.add('search');
        }
        break;
      case 'folder':
        if (!initializedHandlers.has('folder')) {
          handleFolderInput();
          initializedHandlers.add('folder');
        }
        break;
      case 'upload':
        if (!initializedHandlers.has('upload')) {
          handleUploadInput();
          initializedHandlers.add('upload');
        }
        break;
      case 'file':
        const fileJson = atob(modal.dataset.file);
        const file = JSON.parse(fileJson);

        handleShowFileInfo(file);
    }
  });
})();
