import { MAX_FOLDER_NAME } from './constants.js';
import {
  focusOnFirstErrorField,
  removeErrorStylesAndMessages,
  showErrorStylesAndMessages,
} from './validation-helpers.js';

export function handleFolderInput() {
  const form = document.querySelector('#folder-form');

  if (!form) return;

  const input = form.querySelector('input[name="name"]');
  const button = form.querySelector('button[type="submit"]');

  let isSubmitting = false;

  input.focus();

  // Server-side validation
  validateFromServer(form);

  // Client-side validation
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();

    if (isSubmitting) return;

    let isValid = true;

    if (!validateField(input)) {
      isValid = false;
    }

    if (isValid) {
      button.disabled = true;
      button.textContent = 'Creating folder...';

      form.submit();
    } else {
      focusOnFirstErrorField(form);
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

  function validateFromServer(form) {
    const errors = JSON.parse(form.dataset.errors);

    // return if no errors
    if (!errors || Object.keys(errors).length === 0) return;

    // show error style and messages
    for (const [name, error] of Object.entries(errors)) {
      const field = form.querySelector(`input[name=${name}]`);

      showErrorStylesAndMessages(field, error.msg);

      focusOnFirstErrorField(form);
    }
  }
}
