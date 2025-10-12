import { showModal, hideModal } from './lib/modal-helpers.js';
import { showClearButton, hideClearButton } from './lib/search-helpers.js';

// handle mobile search modal show/hide/search
(function handleSearchModalOnMobile() {
  const searchBtn = document.querySelector('#search-btn');
  const searchModal = document.querySelector('#search-modal');

  if (!searchBtn || !searchModal) return;

  let isHidden = true;

  // Toggle search modal when users clicking on sort button
  searchBtn.addEventListener('click', () => {
    if (isHidden) {
      isHidden = showModal('search-modal');
    } else {
      isHidden = hideModal('search-modal');
    }
  });

  // Close search modal when user clicking on `<-`
  searchModal.querySelector('#close-search').addEventListener('click', () => {
    isHidden = hideModal('search-modal');
  });
})();

// Handle desktop search
(function handleSearchModalOnDesktop() {
  const searchForm = document.querySelector('#search-form-desktop');
  const searchInput = document.querySelector('#search-form-desktop input');
  const clearButton = document.querySelector('#search-form-desktop > button');

  if (!searchForm || !searchInput || !clearButton) return;

  // 1. hide clear button on load
  hideClearButton(clearButton);

  // 2. Handle clear button show/hide when user typing
  // 2.1 Show the clear button on mousedown if the input has a value
  searchInput.addEventListener('mousedown', () => {
    if (searchInput.value.trim() !== '') {
      showClearButton(clearButton);
    }
  });

  // 2.2 Show the clear button while the user is typing (hide when input is empty)
  searchInput.addEventListener('input', function () {
    if (this.value.trim() === '') {
      hideClearButton(clearButton);
    } else {
      showClearButton(clearButton);
    }
  });

  // 2.3 Hide clear button when input loses focus and input is empty
  searchInput.addEventListener('blur', () => {
    if (searchInput.value.trim() === '') {
      hideClearButton(clearButton);
    }
  });

  // 3. Clear the input when clear button is clicked
  // 3.1 Prevent the input from blurring when the clear button is clicked.
  // This allows the clear button's click event to fire.
  clearButton.addEventListener('mousedown', (ev) => {
    ev.preventDefault();
  });

  clearButton.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
    hideClearButton(clearButton);
  });

  // 4. Make the input blur when 'Escape' is pressed
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      ev.preventDefault();

      searchInput.blur();
    }
  });
})();

// handle sort modal show/hide/sort
(function handleSortModalOnMobile() {
  const sortBtn = document.querySelector('#sort-btn');
  const sortModal = document.querySelector('#sort-modal');

  if (!sortBtn || !sortModal) return;

  let isHidden = true;

  // Toggle sort modal when users clicking on sort button
  sortBtn.addEventListener('click', () => {
    if (isHidden) {
      isHidden = showModal('sort-modal');
    } else {
      isHidden = hideModal('sort-modal');
    }
  });

  // Close sortModal when user clicking on X
  sortModal.querySelector('#close-sort').addEventListener('click', () => {
    isHidden = hideModal('sort-modal');
  });

  // Close sortModal when user clicking outside it
  document.addEventListener('click', (ev) => {
    if (
      !ev.target.closest('#sort-modal > div') &&
      !ev.target.closest('#sort-btn')
    ) {
      isHidden = hideModal('sort-modal');
    }
  });

  // Close modal when user pressing 'Esc' key
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      ev.preventDefault();

      isHidden = hideModal('sort-modal');
    }
  });

  // Close modal when users submit
  // sortModal.querySelector('form').addEventListener('submit', () => {
  //   isHidden = hideModal('sort-modal');
  // });
})();

/** ----------------- HANDLE SORT ON DESKTOP ----------------- */
(function handleSortOnDesktop() {
  const trigger = document.querySelector('#select-trigger');
  const select = document.querySelector('#sort-select');

  if (!trigger || !select) return;

  let isHidden = true;

  // Toggle select hide/show
  trigger.addEventListener('click', () => {
    if (isHidden) {
      isHidden = showSelect();
    } else {
      isHidden = hideSelect();
    }
  });

  // Close select when clicking outside of it
  document.addEventListener('click', (ev) => {
    if (
      !ev.target.closest('#sort-select') &&
      !ev.target.closest('#select-trigger')
    ) {
      isHidden = hideSelect();
    }
  });

  // close select when pressing 'Esc' key
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      ev.preventDefault();

      isHidden = hideSelect();
    }
  });

  // Handel selecting on sort-by options
  document.querySelectorAll('#sort-select li button').forEach((item) => {
    item.addEventListener('click', () => {
      const sortBy = item.textContent.trim().split('\n')[0];

      // update ui
      document.querySelectorAll('#sort-select  li button').forEach((btn) => {
        btn.lastElementChild.textContent = '';
      });
      item.lastElementChild.innerHTML = '&#x2713;';

      document.querySelector('#sort-by-name').textContent = sortBy;

      // TODO: sort with sortBy

      isHidden = hideSelect();
    });

    // toggle sort order between ascending and descending
    document.querySelector('#sort-info').addEventListener('click', (ev) => {
      ev.stopImmediatePropagation();

      const direction = document.querySelector('#sort-direction');

      if (direction.dataset.order === 'asc') {
        direction.dataset.order = 'desc';
        direction.innerHTML = '&#x2193;';
      } else {
        direction.dataset.order = 'asc';
        direction.innerHTML = '&#x2191;';
      }

      // TODO: sort with new order
    });
  });

  /* --- helpers --- */
  function showSelect() {
    select.classList.remove('hidden');

    return false;
  }

  function hideSelect() {
    select.classList.add('hidden');

    return true;
  }
})();

// Handle breadcrumb back button
(function handleBackOnBreadcrumb() {
  const button = document.querySelector('#breadcrumb-back-btn');

  if (!button) return;

  button.addEventListener('click', () => {
    window.history.back();
  });
})();

// handle folder modal on desktop
(function handleFolderModalOnDesktop() {
  const button = document.querySelector('#folder-btn-for-desktop');

  if (!button) return;
})();
