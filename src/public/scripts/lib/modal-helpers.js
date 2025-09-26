/**
 * ------------------- Modal helpers -------------------
 */

export function showModal(name) {
  const modal = document.querySelector(`#${name}-modal`);

  // 1. Modify the trigger attribute
  document.querySelector(`#${name}-btn`).setAttribute('aria-expanded', 'true');

  // 2. Modify the sortModal classList
  modal.classList.remove('translate-y-full');

  // 3. Prevent scrolling on pages below
  document.body.classList.add('overflow-hidden');

  // 4. Prevent events on pages below
  document.querySelector('#site-container').setAttribute('inert', '');

  // 5. dispatch modal open event after transition end
  modal.addEventListener(
    'transitionend',
    () => {
      document.dispatchEvent(new Event(name + '-modal-open'));
    },
    { once: true },
  );

  // 6. return hidden state
  return false;
}

export function hideModal(name) {
  // 1. Modify the trigger
  document.querySelector(`#${name}-btn`).setAttribute('aria-expanded', 'false');

  // 2. Modify the sortModal classList
  document.querySelector(`#${name}-modal`).classList.add('translate-y-full');

  // 3. Enable scroll on pages below
  document.body.classList.remove('overflow-hidden');

  // 4. Enable events on pages below
  document.querySelector('#site-container').removeAttribute('inert');

  // 5. dispatch modal open event
  document.dispatchEvent(new Event(name + '-modal-hide'));

  // 5. return hidden state
  return true;
}
