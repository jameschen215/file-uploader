import { X, MENU, MOON_STAR, SUN } from './lib/icons.js';

document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;
  const menuBtn = document.querySelector('#menu-btn');
  const menuContent = document.querySelector('#menu-content');
  const iconWrapper = menuBtn?.querySelector('span');
  const themeBtnMobile = document.querySelector('#theme-btn');
  const themeBtnDesktop = document.querySelector('#theme-btn-desktop');
  const themeText = document.querySelector('#theme-text');
  const themeIcon = document.querySelector('#theme-icon');
  const themeTextDesktop = document.querySelector('#theme-text-desktop');
  const themeIconDesktop = document.querySelector('#theme-icon-desktop');
  const dropdownToggle = document.querySelector('#dropdown-btn');
  const dropdownContent = document.querySelector('#dropdown-content');

  const isLoggedIn = !iconWrapper.innerHTML.includes('<svg');
  const avatar = isLoggedIn ? iconWrapper.textContent : '';

  // Update theme text based on current mode
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

  // 1. Initialize theme text
  updateThemeTextAndIcon();

  // 2.1 Handle menu toggle
  if (menuBtn && menuContent && iconWrapper) {
    menuBtn.addEventListener('click', toggleMenu);
  }

  // 2.2 close menu on option click
  document.querySelectorAll('#menu-content li').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // 3.1 handle dropdown toggle
  if (dropdownToggle && dropdownContent) {
    dropdownToggle.addEventListener('click', toggleDropdown);
  }

  // 3.2 close dropdown on option click
  document.querySelectorAll('#dropdown-content li').forEach((link) => {
    link.addEventListener('click', closeDropdown);
  });

  // 3.3 close dropdown when click outside it
  if (dropdownToggle && dropdownContent) {
    document.addEventListener('click', (ev) => {
      if (
        !ev.target.closest('#dropdown-content') &&
        !ev.target.closest('#dropdown-btn')
      ) {
        closeDropdown();
      }
    });
  }

  // 4.1 Handle theme toggle for mobile
  if (themeBtnMobile) {
    themeBtnMobile.addEventListener('click', toggleTheme);
  }

  // 4.2 Handle theme toggle for desktop
  if (themeBtnDesktop) {
    themeBtnDesktop.addEventListener('click', toggleTheme);
  }

  // ------------------------------ helper functions ------------------------------

  // 1. Theme toggle function
  function toggleTheme() {
    html.classList.toggle('dark');

    const theme = html.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    updateThemeTextAndIcon();
  }

  // 2. Menu helper functions
  function toggleMenu() {
    const isOpen = !menuContent.classList.contains('-translate-x-full');

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function openMenu() {
    iconWrapper.innerHTML = X;
    menuBtn.setAttribute('aria-expanded', 'true');

    menuContent.classList.remove('-translate-x-full');
    menuContent.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    if (isLoggedIn) {
      iconWrapper.textContent = avatar;
    } else {
      iconWrapper.innerHTML = MENU;
    }
    menuBtn.setAttribute('aria-expanded', 'false');

    menuContent.classList.add('-translate-x-full');
    menuContent.setAttribute('aria-hidden', 'true');
  }

  // 3. dropdown helper functions
  function toggleDropdown() {
    const isOpen = !dropdownContent.classList.contains('hidden');

    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  function openDropdown() {
    dropdownToggle.querySelector('span').innerHTML = X;
    dropdownToggle.setAttribute('aria-expanded', 'true');

    dropdownContent.classList.remove('hidden');
    dropdownContent.setAttribute('aria-hidden', 'false');
  }

  function closeDropdown() {
    dropdownToggle.querySelector('span').textContent = avatar;
    dropdownToggle.setAttribute('aria-expanded', 'false');

    dropdownContent.classList.add('hidden');
    dropdownContent.setAttribute('aria-hidden', 'true');
  }
});
