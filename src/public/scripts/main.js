import { showModal, hideModal } from './lib/modal-helpers.js';

// Load theme
(function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();

// Handle modal show/hide
(function handleModalVisibility() {
  const modal = document.getElementById('modal');

  let isHidden = true;

  // 1. Show modal with correct content
  document.querySelectorAll('.modal-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const modalName = trigger.id.split('-')[0];

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
    // 2.3.1 Hide modal when clicking on upload link
    modal.querySelector('a[href="/upload"]').addEventListener('click', () => {
      isHidden = hideModal(modal);
    });

    // 2.3.2 open folder modal when clicking on 'new folder' button
    const newFolderBtn = modal.querySelector('#folder-btn');
    if (newFolderBtn) {
      newFolderBtn.addEventListener('click', () => {
        // Hide the add modal first
        isHidden = hideModal(modal);

        // then after add modal hidden, re-open the modal with folder form
        setTimeout(() => {
          isHidden = showModal(
            modal,
            newFolderBtn,
            newFolderBtn.id.split('-')[0],
            'Create new folder',
          );
        }, 50);
      });
    }

    // 2.4 hide on form submit
    modal.querySelector('form').addEventListener('submit', function (ev) {
      ev.preventDefault();

      console.log('in form');

      isHidden = hideModal(modal);

      this.submit();
    });
  });
})();
