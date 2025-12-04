export function showToast(message) {
  const toast = document.querySelector('.toast');
  const content = document.querySelector('.toast-message');

  if (!toast || !content) return;

  if (toast.dataset.isShowing === 'true') return;

  toast.dataset.isShowing = 'true';
  content.textContent = message;

  toast.classList.remove('hidden');
  setTimeout(() => {
    // toast.classList.remove('-translate-y-full');
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');
  }, 50);

  setTimeout(() => {
    toast.classList.add('opacity-0');
    toast.classList.remove('opacity-100');
    // toast.classList.add('-translate-y-full');

    setTimeout(() => {
      toast.classList.add('hidden');
      delete toast.dataset.isShowing;
    }, 500);
  }, 3000);
}
