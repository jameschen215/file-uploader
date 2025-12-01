// Show modal
export function showModal({
  modal,
  file = null,
  folder = null,
  breadcrumbs = null,
}) {
  if (!modal.classList.contains('translate-y-full')) return; // already open

  const modalName = modal.id;
  console.log({ modalName });

  // 1. Modify the trigger attribute
  document.querySelectorAll(`.${modalName}-trigger`).forEach((t) => {
    t.setAttribute('aria-expanded', 'true');
  });

  // 2. Modify classList on modal to show it
  modal.classList.remove('translate-y-full');

  // 3. Prevent scrolling on pages below
  document.body.classList.add('overflow-hidden');

  // 4. Prevent events on pages below
  document.querySelector('#site-container').setAttribute('inert', '');

  // 5. Dispatch modal open event
  document.dispatchEvent(
    new CustomEvent(`${modalName}-open`, {
      detail: { file, folder, breadcrumbs },
    }),
  );

  // 6. Focus on modal to be ready for user to press tab
  modal.focus({ preventScroll: true });

  // 7. return hidden state
  return false;
}

export function hideModal({ modal }) {
  if (!modal || modal.classList.contains('translate-y-full')) return; // already hidden

  const modalName = modal.id;

  // 1. Set aria-expanded to false on all triggers
  document.querySelectorAll(`.${modalName}-trigger`).forEach((t) => {
    t.setAttribute('aria-expanded', 'false');
  });

  // 2. Modify classList on modal to hide it
  modal.classList.add('translate-y-full');

  // 3. Enable scrolling on pages
  document.body.classList.remove('overflow-hidden');

  // 4. Enable events on pages below
  document.querySelector('#site-container').removeAttribute('inert');

  // 5. Dispatch modal hidden event
  document.dispatchEvent(new Event(`${modalName}-hidden`));

  return true;
}

export function showClearButton(button) {
  // button.classList.remove('opacity-0');
  // button.classList.add('opacity-100');
  button.classList.remove('hidden');
  button.classList.remove('pointer-events-none');
}

export function hideClearButton(button) {
  // button.classList.remove('opacity-100');
  // button.classList.add('opacity-0');
  button.classList.add('hidden');
  button.classList.add('pointer-events-none');
}
