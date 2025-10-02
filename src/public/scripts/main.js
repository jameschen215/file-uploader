(function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';

  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();

(function handleModal() {
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

  // 2. Handle actions in modal
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

    // 2.3 open folder modal when clicking on 'new folder' button
    const newFolderBtn = modal.querySelector('#folder-btn');
    if (newFolderBtn) {
      newFolderBtn.addEventListener('click', () => {
        isHidden = showModal(
          modal,
          newFolderBtn,
          newFolderBtn.id.split('-')[0],
          'Create new folder',
        );
      });
    }
  });
})();

function showModal(modal, trigger, modalName, ariaLabel) {
  const content = document.getElementById(modalName + '-in-modal');

  // 1. Modify the trigger attribute
  trigger.setAttribute('aria-expanded', 'true');

  // 2. show modal content
  content.classList.remove('hidden');
  content.classList.add('flex');

  // 3. Modify aria-label attribute on modal
  modal.setAttribute('aria-label', ariaLabel);

  // 4. Modify classList on modal to show it
  modal.classList.remove('translate-y-full');

  // 5. Prevent scrolling on pages below
  document.body.classList.add('overflow-hidden');

  // 6. Prevent events on pages below
  document.querySelector('#site-container').setAttribute('inert', '');

  // 7. dispatch modal open event after transition end
  modal.addEventListener(
    'transitionend',
    () => {
      document.dispatchEvent(new Event(`modal-open`));
    },
    { once: true },
  );

  // 8. return hidden state
  return false;
}

function hideModal(modal) {
  // 1. Set aria-expanded to false on all triggers
  document.querySelectorAll('.modal-trigger').forEach((trigger) => {
    trigger.setAttribute('aria-expanded', 'false');
  });

  // 2. Hide modal content
  modal.querySelectorAll('[id$="in-modal"]').forEach((content) => {
    content.classList.remove('flex');
    content.classList.add('hidden');
  });

  // 3. Modify aria-label attribute on modal
  modal.setAttribute('aria-label', '');

  // 4. Modify classList on modal to hide it
  modal.classList.add('translate-y-full');

  // 5. Enable scrolling on pages
  document.body.classList.remove('overflow-hidden');

  // 6. Enable events on pages below
  document.querySelector('#site-container').removeAttribute('inert');

  return true;
}
