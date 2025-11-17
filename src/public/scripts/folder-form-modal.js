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
      const folder = JSON.parse(trigger.dataset.folder || null);
      showModal({ modal, folder });
    });
  });

  closeButton.addEventListener('click', () => {
    hideModal({ modal });
  });

  // Hide when clicking outside modal content
  document.addEventListener('click', (ev) => {
    if (
      !ev.target.closest('#folder-form-modal > div') &&
      !ev.target.closest('.folder-form-modal-trigger')
    ) {
      hideModal({ modal });
    }
  });
})();

(function handleFolderModalActions() {
  const modal = document.querySelector('#folder-form-modal');
  const form = document.querySelector('#folder-form-modal .folder-form');
  const formTitle = document.querySelector('h2');
  const nameInput = document.querySelector(
    '#folder-form-modal .folder-form input[name="name"]',
  );
  const parentFolderIdInput = document.querySelector(
    '#folder-form-modal .folder-form input[type="hidden"]',
  );
  const submitButton = document.querySelector(
    '#folder-form-modal .folder-form button[type="submit"]',
  );

  if (!modal || !form || !nameInput || !submitButton) return;

  let isCreate = true;
  let isSubmitting = false;
  let folder = null;

  document.addEventListener('folder-form-modal-open', (ev) => {
    if (ev.detail.folder) {
      isCreate = false;
      folder = ev.detail.folder;
      formTitle.textContent = 'Rename folder';
      submitButton.textContent = 'Update';
      parentFolderIdInput.value = folder.parentFolderId || '';
      nameInput.value = folder.name;
    }

    nameInput.focus();
  });

  // Client-side validation
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    if (isSubmitting) return;

    let isValid = true;
    console.log({ nameInput });

    if (!validateField(nameInput)) {
      isValid = false;
    }

    if (!isValid) {
      focusOnFirstErrorField(form);
    } else {
      const formData = new FormData(form);

      // 1. Disable nameInput and submit button
      submitButton.textContent = isCreate ? 'Creating...' : 'Updating...';
      nameInput.disabled = true;
      submitButton.disabled = true;
      isSubmitting = true;

      let resp = null;

      try {
        if (isCreate) {
          resp = await fetch('/folders', {
            method: 'POST',
            body: formData,
          });
        } else {
          resp = await fetch(`/folders/${folder.id}`, {
            method: 'PUT',
            body: formData,
          });
        }

        const data = await resp.json();

        if (!resp.ok) {
          // 2. Show validation errors
          if (data.errors?.name) {
            showErrorStylesAndMessages(nameInput, data.errors.name.msg);
            focusOnFirstErrorField(form);
          }
          return;
        }

        // Success - reset form and hide modal
        alert(data.message);
        form.reset();
        hideModal({ modal });
        window.location.reload();
      } catch (error) {
        console.error('Error submitting folder: ', error);
      } finally {
        // Re-enable nameInput and submit button
        nameInput.disabled = false;
        submitButton.disabled = false;
        submitButton.textContent = isCreate ? 'Create' : 'Update';
        isSubmitting = false;
      }
    }
  });

  // Remove error info while user typing
  nameInput.addEventListener('input', () =>
    removeErrorStylesAndMessages(nameInput),
  );

  // Clear the nameInput value when the modal is about to close
  document.addEventListener('folder-form-modal-hidden', () => {
    nameInput.value = '';
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
