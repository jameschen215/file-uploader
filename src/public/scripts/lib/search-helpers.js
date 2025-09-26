export function showClearButton(button) {
  button.classList.remove('opacity-0');
  button.classList.remove('pointer-events-none');
  button.classList.add('opacity-100');
}

export function hideClearButton(button) {
  button.classList.remove('opacity-100');
  button.classList.add('opacity-0');
  button.classList.add('pointer-events-none');
}
