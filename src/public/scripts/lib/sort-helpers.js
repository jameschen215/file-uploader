export function handleSortInput() {
  const form = document.querySelector('#sort-in-modal form');

  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', () => {
    // disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Applying...';
  });
}
