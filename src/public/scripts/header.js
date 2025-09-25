document.addEventListener('DOMContentLoaded', () => {
  const sortBtn = document.querySelector('#sort-btn');
  const modal = document.querySelector('#sort-menu-modal');

  let isHidden = true;

  if (sortBtn && modal) {
    sortBtn.addEventListener('click', () => {
      if (isHidden) {
        showModal();
      } else {
        hideModal();
      }
    });

    // Close modal when user clicking on X
    modal.querySelector('#close-modal').addEventListener('click', hideModal);

    // Close modal when user clicking outside it
    document.addEventListener('click', (ev) => {
      if (
        !ev.target.closest('#sort-menu-modal > div') &&
        !ev.target.closest('#sort-btn')
      ) {
        hideModal();
      }
    });

    // Close modal when user pressing 'Esc' key
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        hideModal();
      }
    });
  }

  function showModal() {
    // Modify the trigger attribute
    sortBtn.setAttribute('aria-expanded', 'true');

    // Modify the modal classList
    modal.classList.remove('translate-y-full');
    document.body.classList.add('overflow-hidden');

    // Prevent events on pages below
    document.querySelector('#site-container').setAttribute('inert', '');

    isHidden = !isHidden;
  }

  function hideModal() {
    // Modify the trigger
    sortBtn.setAttribute('aria-expanded', 'false');

    // Modify the modal classList
    modal.classList.add('translate-y-full');
    document.body.classList.remove('overflow-hidden');

    // Enable events
    document.querySelector('#site-container').removeAttribute('inert');

    isHidden = !isHidden;
  }
});
