export function handleSearchInput() {
  const form = document.querySelector('#search-form-in-modal');
  const input = document.querySelector('#search-form-in-modal > input');
  const clearButton = document.querySelector('#search-form-in-modal > button');

  if (!form || !input || !clearButton) return;

  // 1. Hide clear button on load
  hideClearButton(clearButton);

  // 2. Focus on search input
  input.focus();

  // 3. Handle clear button visibility when typing on input
  // 3.1 Show it on mousedown if the input has a value
  input.addEventListener('mousedown', () => {
    if (input.value.trim() !== '') {
      showClearButton(clearButton);
    }
  });

  // 3.2 Show it while on input but hide it when the input value is empty
  input.addEventListener('input', function () {
    if (this.value.trim() === '') {
      hideClearButton(clearButton);
    } else {
      showClearButton(clearButton);
    }
  });

  // 3.2 Hide it when input loses focus
  input.addEventListener('blur', function () {
    if (this.value.trim() === '') {
      hideClearButton(clearButton);
    }
  });

  // 4. Clear input value
  // 4.1 Prevent input form blurring when the clear button is clicked
  //  This allows the clear button's click event to fire.
  clearButton.addEventListener('mousedown', (ev) => ev.preventDefault());

  // 4.2 Clear it when clear button is clicked
  clearButton.addEventListener('click', function () {
    input.value = '';
    input.focus();
    hideClearButton(this);
  });

  // 4.3 Clear it when the modal is hidden
  document.addEventListener('modal-hide', () => {
    input.value = '';
  });

  // 5. Make input blur when 'Escape' is pressed
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      ev.preventDefault();

      input.blur();
    }
  });

  // 6. Submit search form
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const query = input.value.trim();
    const resultsContainer = document.querySelector(
      '#search-results-for-mobile',
    );

    resultsContainer.innerHTML = '<li>🧐 Searching...</li>';

    try {
      const url = form.action + `?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);

      const files = await res.json();

      if (files.length === 0) {
        resultsContainer.innerHTML = `<li>No results found.</li>`;
        return;
      }

      resultsContainer.innerHTML = files
        .map((file) => {
          console.log('Processing file:', file);
          return `<li class="p-2 border-b">${file.originalName || file.name || 'Unnamed'}</li>`;
        })
        .join('');
    } catch (error) {
      console.error('Error details:', error);
      resultsContainer.innerHTML =
        '<li class="text-red-500">Error searching files</li>';
    }
  });
}

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
