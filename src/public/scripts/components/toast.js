import { icon } from '../lib/get-icon.js';

const toastStyles = {
  success: {
    bg: 'bg-green-50/50 dark:bg-green-900/50 backdrop-blur-sm',
    text: 'text-green-600 dark:text-green-400',
    icon: 'Check',
    border: 'border-green-100 dark:border-green-800',
  },
  error: {
    bg: 'bg-red-50/50 dark:bg-red-900/50 backdrop-blur-sm',
    text: 'text-red-600 dark:text-red-400',
    icon: 'X',
    border: 'border-red-100 dark:border-red-800',
  },
  warning: {
    bg: 'bg-yellow-50/50 dark:bg-yellow-900/50 backdrop-blur-sm',
    text: 'text-yellow-600 dark:text-yellow-400',
    icon: 'TriangleAlert',
    border: 'border-yellow-100 dark:border-yellow-800',
  },
  info: {
    bg: 'bg-sky-50/50 dark:bg-sky-900/50 backdrop-blur-sm',
    text: 'text-sky-600 dark:text-sky-400',
    icon: 'Info',
    border: 'border-sky-100 dark:border-sky-800',
  },
};

export function showToast(message, type = 'info', duration = 3000) {
  const container = document.querySelector('#toast-container');
  const style = toastStyles[type] || toastStyles.info;

  // Limit to 5 toasts to prevent clutter
  if (container.childElementCount >= 5) {
    // Remove the older one immediately
    container.removeChild(container.firstChild);
  }

  // 1. Create the element
  const toast = document.createElement('div');
  toast.className = `${style.bg} ${style.text} px-4 py-3 rounded-md border shadow-md ${style.border} flex items-center gap-4 toast-enter`;
  toast.innerHTML = `
    <span class="flex-shrink-0">${icon({ name: style.icon, size: 16 })}</span>
    <p class="flex-1 text-sm">${message}</p>
    <button class="${style.text} opacity-75 hover:opacity-100 flex-shrink-0 text-xl leading-none transition-opacity">&times;</button>
  `;
  toast.querySelector('button').addEventListener('click', function () {
    removeToast(this);
  });

  // 2. Add to DOM
  container.appendChild(toast);

  // 3. Auto remove after duration
  setTimeout(() => {
    removeToast(toast.querySelector('button'));
  }, duration);
}

function removeToast(btn) {
  const toast = btn.closest('div[class*="bg-"]');

  // Remove animation
  toast.classList.remove('toast-enter');
  toast.classList.add('toast-exit');

  // To prevent the race condition, listen for the animation end event
  // instead of using `setTimeOut`, which will cause flashes because sometimes
  // the animation finishes and the element snaps back visible before the
  // the `setTimeOut` removes it.
  toast.addEventListener(
    'animationend',
    () => {
      toast.remove();
    },
    { once: true },
  );
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.remove-toast-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      console.log('button clicked');
      removeToast(this);
    });
  });
});
