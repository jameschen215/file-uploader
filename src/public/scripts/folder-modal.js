import { MAX_FOLDER_NAME } from './lib/constants.js';
import { hideModal, showModal } from './lib/modal-helpers.js';
import {
  focusOnFirstErrorField,
  removeErrorStylesAndMessages,
  showErrorStylesAndMessages,
} from './lib/validation-helpers.js';

(function handleAddModalVisibility() {
  const triggers = document.querySelectorAll('[id^="folder-btn"]');
  const modal = document.querySelector('#folder-modal');
  const closeButton = document.querySelector('#folder-modal .close-modal-btn');

  if (!triggers || !modal || !closeButton) return;

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      showModal(modal, trigger);
    });
  });

  closeButton.addEventListener('click', () => {
    triggers.forEach((trigger) => {
      hideModal(modal, trigger);
    });
  });

  // Hide when clicking outside modal content
  document.addEventListener('click', (ev) => {
    if (
      !ev.target.closest('#folder-modal > div') &&
      !ev.target.closest('#folder-btn-for-mobile') &&
      !ev.target.closest('#folder-btn-for-desktop')
    ) {
      triggers.forEach((trigger) => {
        hideModal(modal, trigger);
      });
    }
  });
})();

(function handleFolderModalActions() {
  const trigger = document.querySelector('#folder-btn-for-mobile');
  const modal = document.querySelector('#folder-modal');
  const form = document.querySelector('#folder-modal .folder-form');
  const input = document.querySelector(
    '#folder-modal .folder-form input[name="name"]',
  );
  const submitButton = document.querySelector(
    '#folder-modal .folder-form button[type="submit"]',
  );

  if (!modal || !form || !input || !submitButton || !trigger) return;

  let isSubmitting = false;

  document.addEventListener('folder-modal-open', () => {
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
        hideModal(modal, trigger);
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
  document.addEventListener('folder-modal-hidden', () => {
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
