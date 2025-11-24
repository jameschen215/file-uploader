import { icon } from './lib/icons.js';

const iconWrapper = document.querySelector('#menu-btn span');
const isLoggedIn = !iconWrapper.innerHTML.includes('<svg');
const avatar = isLoggedIn ? iconWrapper.textContent : '';

/** ----------------- 2. HANDLE SORT ON DESKTOP ----------------- */
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
      const sortBy = item.textContent.trim().split('\n')[0].toLowerCase();

      // update ui
      document.querySelectorAll('#sort-select  li button').forEach((btn) => {
        btn.lastElementChild.textContent = '';
      });

      item.lastElementChild.innerHTML = '&#x2713;';

      const sortByEl = document.querySelector('#sort-by');
      sortByEl.textContent = sortBy;
      sortByEl.dataset.sortBy = sortBy;

      isHidden = hideSelect();

      submitSort();
    });

    // toggle sort order between ascending and descending
    document.querySelector('#sort-info').addEventListener('click', (ev) => {
      ev.stopImmediatePropagation();

      const direction = document.querySelector('#sort-direction');

      if (direction.dataset.direction === 'asc') {
        direction.dataset.direction = 'desc';
        direction.innerHTML = '&#x2193;';
      } else {
        direction.dataset.direction = 'asc';
        direction.innerHTML = '&#x2191;';
      }

      submitSort();
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

  function submitSort() {
    const sortBy = document.querySelector('#sort-by').dataset.sortBy;
    const direction =
      document.querySelector('#sort-direction').dataset.direction;

    window.location.href = `/?sortBy=${sortBy}&sortDirection=${direction}`;
  }
})();

/** ----------------- 3. HANDLE BREADCRUMBS GO BACK ----------------- */
(function handleBackOnBreadcrumb() {
  const button = document.querySelector('#breadcrumb-back-btn');

  if (!button) return;

  button.addEventListener('click', () => {
    window.history.back();
  });
})();

/** ----------------- 4 HANDLE THEME LOADING AND TOGGLING ----------------- */
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
      themeIcon.innerHTML = isDark
        ? icon({ name: 'Sun', size: 20 })
        : icon({ name: 'MoonStar', size: 20 });
      themeText.textContent = isDark
        ? 'Switch to light mode'
        : 'Switch to dark mode';
    }

    if (themeIconDesktop && themeTextDesktop) {
      themeIconDesktop.innerHTML = isDark
        ? icon({ name: 'Sun', size: 20 })
        : icon({ name: 'MoonStar', size: 20 });
      themeTextDesktop.textContent = isDark
        ? 'Switch to light mode'
        : 'Switch to dark mode';
    }
  }
})();

/** ----------------- 5. HANDLE HAMBURGER MENU SHOW/HIDE ----------------- */
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
    iconWrapper.innerHTML = icon({ name: 'X', size: 20 });
    trigger.setAttribute('aria-expanded', 'true');

    content.classList.remove('-translate-x-full');
    content.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    iconWrapper.innerHTML = isLoggedIn
      ? avatar
      : icon({ name: 'Menu', size: 20 });

    trigger.setAttribute('aria-expanded', 'false');

    content.classList.add('-translate-x-full');
    content.setAttribute('aria-hidden', 'true');
  }
})();

/** ----------------- 6. HANDLE DROPDOWN MENU SHOW/HIDE ----------------- */
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
    trigger.querySelector('span').innerHTML = icon({ name: 'X', size: 20 });
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
