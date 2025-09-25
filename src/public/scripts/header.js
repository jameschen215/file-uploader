document.addEventListener('DOMContentLoaded', () => {
  // handle search modal show/hide/search
  (function handleSearchModal() {
    const searchBtn = document.querySelector('#search-btn');
    const searchModal = document.querySelector('#search-modal');

    if (!searchBtn || !searchModal) return;

    let isHidden = true;

    // Toggle search modal when users clicking on sort button
    searchBtn.addEventListener('click', () => {
      if (isHidden) {
        isHidden = showModal('search');
      } else {
        isHidden = hideModal('search');
      }
    });

    // Close search modal when user clicking on `<-`
    searchModal.querySelector('#close-search').addEventListener('click', () => {
      isHidden = hideModal('search');
    });
  })();

  // handle sort modal show/hide/sort
  (function handleSortModal() {
    const sortBtn = document.querySelector('#sort-btn');
    const sortModal = document.querySelector('#sort-modal');

    if (!sortBtn && !sortModal) return;

    let isHidden = true;

    // Toggle sort modal when users clicking on sort button
    sortBtn.addEventListener('click', () => {
      if (isHidden) {
        isHidden = showModal('sort');
      } else {
        isHidden = hideModal('sort');
      }
    });

    // Close sortModal when user clicking on X
    sortModal.querySelector('#close-sort').addEventListener('click', () => {
      isHidden = hideModal('sort');
    });

    // Close sortModal when user clicking outside it
    document.addEventListener('click', (ev) => {
      if (
        !ev.target.closest('#sort-modal > div') &&
        !ev.target.closest('#sort-btn')
      ) {
        isHidden = hideModal('sort');
      }
    });

    // Close modal when user pressing 'Esc' key
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();

        isHidden = hideModal('sort');
      }
    });
  })();

  /**
   * ------------------- helpers -------------------
   */

  function showModal(name) {
    const modal = document.querySelector(`#${name}-modal`);

    // 1. Modify the trigger attribute
    document
      .querySelector(`#${name}-btn`)
      .setAttribute('aria-expanded', 'true');

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

  function hideModal(name) {
    // 1. Modify the trigger
    document
      .querySelector(`#${name}-btn`)
      .setAttribute('aria-expanded', 'false');

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
});
