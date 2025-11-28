document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('#breadcrumb-back-btn');

  if (!button) return;

  button.addEventListener('click', () => {
    window.history.back();
  });
});
