import { icon } from '../lib/get-icon.js';

document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;
  const themeTextEls = document.querySelectorAll('.theme-text');
  const themeIconEls = document.querySelectorAll('.theme-icon');
  // const themeIconDesktop = document.querySelector('#theme-icon-desktop');
  // const themeTextDesktop = document.querySelector('#theme-text-desktop');

  // Load theme
  loadTheme();

  // Initialize theme text
  updateThemeTextAndIcon();

  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      console.log('theme toggle clicked');

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

    if (!themeIconEls || !themeTextEls) return;

    themeIconEls.forEach((el) => {
      el.innerHTML = isDark
        ? icon({ name: 'Sun', size: 20 })
        : icon({ name: 'MoonStar', size: 20, strokeWidth: 1.5 });
    });

    themeTextEls.forEach((el) => {
      el.innerHTML = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    });
  }
});
