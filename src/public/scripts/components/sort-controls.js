document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.querySelector('#select-trigger');
  const select = document.querySelector('#sort-select');

  if (!trigger || !select) return;

  let isHidden = true;

  // Toggle select hide/show
  trigger.addEventListener('click', () => {
    if (isHidden) {
      isHidden = showSelect();
    } else {
      isHidden = hideSelect();
    }
  });

  // Close select when clicking outside of it
  document.addEventListener('click', (ev) => {
    if (
      !ev.target.closest('#sort-select') &&
      !ev.target.closest('#select-trigger')
    ) {
      isHidden = hideSelect();
    }
  });

  // close select when pressing 'Esc' key
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      ev.preventDefault();

      isHidden = hideSelect();
    }
  });

  // Handel selecting on sort-by options
  document.querySelectorAll('#sort-select li button').forEach((item) => {
    item.addEventListener('click', () => {
      const sortBy = item.textContent.trim().split('\n')[0].toLowerCase();

      // update ui
      document.querySelectorAll('#sort-select  li button').forEach((btn) => {
        btn.lastElementChild.textContent = '';
      });

      item.lastElementChild.innerHTML = '&#x2713;';

      const sortByEl = document.querySelector('#sort-by');
      sortByEl.textContent = sortBy;
      sortByEl.dataset.sortBy = sortBy;

      isHidden = hideSelect();

      submitSort();
    });

    // toggle sort order between ascending and descending
    document.querySelector('#sort-info').addEventListener('click', (ev) => {
      ev.stopImmediatePropagation();

      const direction = document.querySelector('#sort-direction');

      if (direction.dataset.direction === 'asc') {
        direction.dataset.direction = 'desc';
        direction.innerHTML = '&#x2193;';
      } else {
        direction.dataset.direction = 'asc';
        direction.innerHTML = '&#x2191;';
      }

      submitSort();
    });
  });

  /* --- helpers --- */
  function showSelect() {
    select.classList.remove('hidden');

    return false;
  }

  function hideSelect() {
    select.classList.add('hidden');

    return true;
  }

  function submitSort() {
    const sortBy = document.querySelector('#sort-by').dataset.sortBy;
    const direction =
      document.querySelector('#sort-direction').dataset.direction;

    window.location.href = `/?sortBy=${sortBy}&sortDirection=${direction}`;
  }
});
