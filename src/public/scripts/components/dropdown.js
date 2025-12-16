import { icon } from '../lib/get-icon.js';

document.addEventListener('DOMContentLoaded', () => {
  const iconWrapper = document.querySelector('#dropdown-toggle .icon-wrapper');

  const trigger = document.querySelector('#dropdown-toggle');
  const content = document.querySelector('#dropdown-content');

  if (!trigger || !content || !iconWrapper) return;

  const isLoggedIn = !iconWrapper.innerHTML.includes('<svg');
  const avatar = isLoggedIn ? iconWrapper.innerHTML : '';
  let isOpen = false;

  // 1. Toggle content hide/show when clicking on trigger
  trigger.addEventListener('click', () => {
    console.log('clicked');
    if (isOpen) {
      isOpen = closeDropdown();
    } else {
      isOpen = openDropdown();
    }
  });

  // // 2. Close dropdown when clicking on dropdown items
  document.querySelectorAll('#dropdown-content li').forEach((li) => {
    li.addEventListener('click', () => (isOpen = closeDropdown()));
  });

  // 3. Close dropdown when clicking outside of it
  document.addEventListener('click', (ev) => {
    if (
      !ev.target.closest('#dropdown-content') &&
      !ev.target.closest('#dropdown-toggle')
    ) {
      isOpen = closeDropdown();
    }
  });

  function openDropdown() {
    console.log('open it');
    trigger.querySelector('.icon-wrapper').innerHTML = icon({
      name: 'X',
      size: 20,
    });
    trigger.setAttribute('aria-expanded', 'true');

    content.classList.remove('hidden');
    content.setAttribute('aria-hidden', 'false');

    return true;
  }

  function closeDropdown() {
    trigger.querySelector('.icon-wrapper').innerHTML = avatar;
    trigger.setAttribute('aria-expanded', 'false');

    content.classList.add('hidden');
    content.setAttribute('aria-hidden', 'true');

    return false;
  }
});
