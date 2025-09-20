const ICON_X = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
const ICON_MENU = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu-icon lucide-menu"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>`;

document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;
  const menuBtn = document.querySelector('#menu-btn');
  const menuContent = document.querySelector('#menu-content');
  const iconWrapper = menuBtn?.querySelector('span');
  const themeBtnMobile = document.querySelector('#theme-btn');
  const themeBtnDesktop = document.querySelector('#theme-btn-desktop');
  const themeText = document.querySelector('#theme-text');

  // Update theme text based on current mode
  function updateThemeText() {
    if (themeText) {
      const isDark = html.classList.contains('dark');
      themeText.textContent = isDark
        ? 'Switch to light mode'
        : 'Switch to dark mode';
    }
  }

  // Initialize theme text
  updateThemeText();

  // Handle menu toggle
  if (menuBtn && menuContent && iconWrapper) {
    menuBtn.addEventListener('click', toggleMenu);
  }

  // Handle menu close on option click
  document.querySelectorAll('#menu-content li a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Handle theme toggle for mobile
  if (themeBtnMobile) {
    themeBtnMobile.addEventListener('click', toggleTheme);
  }

  // Handle theme toggle for desktop
  if (themeBtnDesktop) {
    themeBtnDesktop.addEventListener('click', toggleTheme);
  }

  // Theme toggle function
  function toggleTheme() {
    console.log('toggle theme');
    console.log('Before toggle - html classes:', html.classList.toString());
    console.log('Contains dark before:', html.classList.contains('dark'));

    html.classList.toggle('dark');

    console.log('After toggle - html classes:', html.classList.toString());
    console.log('Contains dark after:', html.classList.contains('dark'));

    const theme = html.classList.contains('dark') ? 'dark' : 'light';
    console.log('Theme to save:', theme);

    localStorage.setItem('theme', theme);
    updateThemeText();
  }

  // Menu helper functions
  function toggleMenu() {
    menuContent.classList.toggle('-translate-x-full');
    const isOpen = !menuContent.classList.contains('-translate-x-full');

    if (isOpen) {
      iconWrapper.innerHTML = ICON_X;
      menuBtn.setAttribute('aria-expanded', 'true');
    } else {
      iconWrapper.innerHTML = ICON_MENU;
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function closeMenu() {
    menuContent.classList.add('-translate-x-full');
    iconWrapper.innerHTML = ICON_MENU;
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});
