import { X, MENU, MOON_STAR, SUN } from './lib/icons.js';
import { showClearButton, hideClearButton } from './lib/search-helpers.js';

const iconWrapper = document.querySelector('#menu-btn span');
const isLoggedIn = !iconWrapper.innerHTML.includes('<svg');
const avatar = isLoggedIn ? iconWrapper.textContent : '';

// handle mobile search modal show/hide/search
// (function handleSearchModalOnMobile() {
//   const searchBtn = document.querySelector('#search-btn');
//   const searchModal = document.querySelector('#search-modal');

//   if (!searchBtn || !searchModal) return;

//   let isHidden = true;

//   // Toggle search modal when users clicking on sort button
//   searchBtn.addEventListener('click', () => {
//     if (isHidden) {
//       isHidden = showModal('search-modal');
//     } else {
//       isHidden = hideModal('search-modal');
//     }
//   });

//   // Close search modal when user clicking on `<-`
//   searchModal.querySelector('#close-search').addEventListener('click', () => {
//     isHidden = hideModal('search-modal');
//   });
// })();

// Handle desktop search

(function handleSearchOnDesktop() {
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
// (function handleSortModalOnMobile() {
//   const sortBtn = document.querySelector('#sort-btn');
//   const sortModal = document.querySelector('#sort-modal');

//   if (!sortBtn || !sortModal) return;

//   let isHidden = true;

//   // Toggle sort modal when users clicking on sort button
//   sortBtn.addEventListener('click', () => {
//     if (isHidden) {
//       isHidden = showModal('sort-modal');
//     } else {
//       isHidden = hideModal('sort-modal');
//     }
//   });

//   // Close sortModal when user clicking on X
//   sortModal.querySelector('#close-sort').addEventListener('click', () => {
//     isHidden = hideModal('sort-modal');
//   });

//   // Close sortModal when user clicking outside it
//   document.addEventListener('click', (ev) => {
//     if (
//       !ev.target.closest('#sort-modal > div') &&
//       !ev.target.closest('#sort-btn')
//     ) {
//       isHidden = hideModal('sort-modal');
//     }
//   });

//   // Close modal when user pressing 'Esc' key
//   document.addEventListener('keydown', (ev) => {
//     if (ev.key === 'Escape') {
//       ev.preventDefault();

//       isHidden = hideModal('sort-modal');
//     }
//   });
// })();

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

// Handle theme actions
(function handleThemeToggle() {
  const html = document.documentElement;
  const themeText = document.querySelector('#theme-text');
  const themeIcon = document.querySelector('#theme-icon');
  const themeIconDesktop = document.querySelector('#theme-icon-desktop');
  const themeTextDesktop = document.querySelector('#theme-text-desktop');

  // Load theme
  loadTheme();

  // Initialize theme text
  updateThemeTextAndIcon();

  document.querySelectorAll('[id^="theme-btn"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      html.classList.toggle('dark');

      const theme = html.classList.contains('dark') ? 'dark' : 'light';
      localStorage.setItem('theme', theme);

      updateThemeTextAndIcon();
    });
  });

  function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }

  function updateThemeTextAndIcon() {
    const isDark = html.classList.contains('dark');

    if (themeText && themeIcon) {
      themeIcon.innerHTML = isDark ? SUN : MOON_STAR;
      themeText.textContent = isDark
        ? 'Switch to light mode'
        : 'Switch to dark mode';
    }

    if (themeIconDesktop && themeTextDesktop) {
      themeIconDesktop.innerHTML = isDark ? SUN : MOON_STAR;
      themeTextDesktop.textContent = isDark
        ? 'Switch to light mode'
        : 'Switch to dark mode';
    }
  }
})();

// Handle burger menu show/hide
(function handleHamburgerMenu() {
  const trigger = document.querySelector('#menu-btn');
  const content = document.querySelector('#menu-content');

  if (!trigger || !content || !iconWrapper) return;

  // 1. Toggle content hide/show when clicking on trigger
  trigger.addEventListener('click', () => {
    const isOpen = !content.classList.contains('-translate-x-full');

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // 2. Close menu when clicking on menu items
  document.querySelectorAll('#menu-content li').forEach((li) => {
    li.addEventListener('click', closeMenu);
  });

  function openMenu() {
    iconWrapper.innerHTML = X;
    trigger.setAttribute('aria-expanded', 'true');

    content.classList.remove('-translate-x-full');
    content.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    iconWrapper.innerHTML = isLoggedIn ? avatar : MENU;

    trigger.setAttribute('aria-expanded', 'false');

    content.classList.add('-translate-x-full');
    content.setAttribute('aria-hidden', 'true');
  }
})();

// Handle dropdown menu show/hide
(function handleDropdownMenu() {
  const trigger = document.querySelector('#dropdown-btn');
  const content = document.querySelector('#dropdown-content');

  const isLoggedIn = !iconWrapper.innerHTML.includes('<svg');
  const avatar = isLoggedIn ? iconWrapper.textContent : '';

  if (!trigger || !content) return;

  // 1. Toggle content hide/show when clicking on trigger
  trigger.addEventListener('click', () => {
    const isOpen = !content.classList.contains('hidden');

    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  // 2. Close dropdown when clicking on dropdown items
  document.querySelectorAll('#dropdown-content li').forEach((li) => {
    li.addEventListener('click', closeDropdown);
  });

  // 3. Close dropdown when clicking outside of it
  document.addEventListener('click', (ev) => {
    if (
      !ev.target.closest('#dropdown-content') &&
      !ev.target.closest('#dropdown-btn')
    ) {
      closeDropdown();
    }
  });

  function openDropdown() {
    trigger.querySelector('span').innerHTML = X;
    trigger.setAttribute('aria-expanded', 'true');

    content.classList.remove('hidden');
    content.setAttribute('aria-hidden', 'false');
  }

  function closeDropdown() {
    trigger.querySelector('span').innerHTML = avatar;
    trigger.setAttribute('aria-expanded', 'false');

    content.classList.add('hidden');
    content.setAttribute('aria-hidden', 'true');
  }
})();
