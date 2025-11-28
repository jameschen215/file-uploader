import { icon } from './lib/get-icon.js';

document.addEventListener('DOMContentLoaded', () => {
  const iconWrapper = document.querySelector('#menu-toggle span');
  const trigger = document.querySelector('#menu-toggle');
  const content = document.querySelector('#menu-content');

  if (!trigger || !content || !iconWrapper) return;

  const isLoggedIn = !iconWrapper.innerHTML.includes('<svg');
  const avatar = isLoggedIn ? iconWrapper.textContent : '';

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
});
