import { MAX_FOLDER_NAME } from './constants.js';
import { hideModal } from './modal-helpers.js';
import {
  focusOnFirstErrorField,
  removeErrorStylesAndMessages,
  showErrorStylesAndMessages,
} from './validation-helpers.js';

export function handleFolderInput() {
  const modal = document.getElementById('modal');
  const form = document.querySelector('#folder-form');

  if (!modal || !form) return;

  const input = form.querySelector('input[name="name"]');
  const button = form.querySelector('button[type="submit"]');

  let isSubmitting = false;

  input.focus();

  // Client-side validation
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    console.log('Submitting...');

    if (isSubmitting) return;

    let isValid = true;

    if (!validateField(input)) {
      isValid = false;
    }

    if (!isValid) {
      focusOnFirstErrorField(form);
    } else {
      const formData = new FormData(form);

      // 1. Disable input and button
      input.disabled = true;
      button.disabled = true;
      button.textContent = 'Creating folder...';

      isSubmitting = true;

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          // 2. Show validation errors
          if (data.errors?.name) {
            showErrorStylesAndMessages(input, data.errors.name.msg);
            focusOnFirstErrorField(form);
          }

          // 3. Re-enable input and button
          input.disabled = false;
          button.disabled = false;
          button.textContent = 'Create';
          return;
        }

        // Success — reset form and hide modal
        form.reset();
        hideModal(modal);
        window.location.reload();
      } catch (error) {
        console.error('Error submitting folder:', error);

        // Re-enable input and button in case of network errors
        input.disabled = false;
        button.disabled = false;
        button.textContent = 'Create';
      }
    }

    isSubmitting = false;
  });

  // Remove error info while user typing
  input.addEventListener('input', () => removeErrorStylesAndMessages(input));

  // Clear the input value when the modal is about to close
  document.addEventListener('modal-hide', () => {
    input.value = '';
  });

  function validateField(field) {
    const value = field.value.trim();

    let isValid = true;
    let errorMessage = '';

    if (!value) {
      isValid = false;
      errorMessage = 'Folder name is required';
    } else if (value.length > MAX_FOLDER_NAME) {
      isValid = false;
      errorMessage = 'Folder name must be at most 20 characters long.';
    } else if (!/^[A-Za-z0-9_-]{1,20}$/.test(value)) {
      isValid = false;
      errorMessage = 'Invalid folder name';
    }

    if (isValid) {
      removeErrorStylesAndMessages(field);
    } else {
      showErrorStylesAndMessages(field, errorMessage);
    }

    return isValid;
  }
}
