import { MAX_FOLDER_NAME } from './lib/constants.js';
import { hideModal, showModal } from './lib/modal-helpers.js';
import {
  focusOnFirstErrorField,
  removeErrorStylesAndMessages,
  showErrorStylesAndMessages,
} from './lib/validation-helpers.js';

(function handleAddModalVisibility() {
  const createTriggers = document.querySelectorAll(
    '.folder-form-modal-trigger',
  );
  const modal = document.querySelector('#folder-form-modal');
  const closeButton = document.querySelector(
    '#folder-form-modal .close-modal-btn',
  );

  if (!createTriggers || !modal || !closeButton) return;

  createTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (ev) => {
      showModal(modal, trigger);
    });
  });

  closeButton.addEventListener('click', () => {
    hideModal(modal);
  });

  // Hide when clicking outside modal content
  document.addEventListener('click', (ev) => {
    if (
      !ev.target.closest('#folder-form-modal > div') &&
      !ev.target.closest('.folder-form-modal-trigger')
    ) {
      hideModal(modal);
    }
  });
})();

(function handleFolderModalActions() {
  const modal = document.querySelector('#folder-form-modal');
  const form = document.querySelector('#folder-form-modal .folder-form');
  const input = document.querySelector(
    '#folder-form-modal .folder-form input[name="name"]',
  );
  const submitButton = document.querySelector(
    '#folder-form-modal .folder-form button[type="submit"]',
  );

  if (!modal || !form || !input || !submitButton) return;

  let isSubmitting = false;

  document.addEventListener('folder-form-modal-open', () => {
    input.focus();
  });

  // Client-side validation
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    if (isSubmitting) return;

    let isValid = true;
    console.log({ input });

    if (!validateField(input)) {
      isValid = false;
    }

    if (!isValid) {
      focusOnFirstErrorField(form);
    } else {
      const formData = new FormData(form);

      // 1. Disable input and submit button
      input.disabled = true;
      submitButton.disabled = true;
      submitButton.textContent = 'Creating folder...';
      isSubmitting = true;

      try {
        const resp = await fetch(form.action, {
          method: 'POST',
          body: formData,
        });

        const data = await resp.json();

        if (!resp.ok) {
          // 2. Show validation errors
          if (data.errors?.name) {
            showErrorStylesAndMessages(input, data.errors.name.msg);
            focusOnFirstErrorField(form);
          }

          return;
        }

        // Success - reset form and hide modal
        form.reset();
        hideModal(modal);
        window.location.reload();
      } catch (error) {
        console.error('Error submitting folder: ', error);
      } finally {
        // Re-enable input and submit button
        input.disabled = false;
        submitButton.disabled = false;
        submitButton.textContent = 'Create';
        isSubmitting = false;
      }
    }
  });

  // Remove error info while user typing
  input.addEventListener('input', () => removeErrorStylesAndMessages(input));

  // Clear the input value when the modal is about to close
  document.addEventListener('folder-form-modal-hidden', () => {
    input.value = '';
  });

  function validateField(field) {
    const value = field.value.trim();
    console.log({ value });

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
})();
