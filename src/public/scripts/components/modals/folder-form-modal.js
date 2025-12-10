import { MAX_FOLDER_NAME } from '../../lib/constants.js';
import { hideModal, showModal } from '../../lib/modal-helpers.js';
import {
  focusOnFirstErrorField,
  removeErrorStylesAndMessages,
  showErrorStylesAndMessages,
} from '../../lib/validation-helpers.js';
import { showToast } from '../toast.js';

import { getFolderItem } from '../../partials/template.js';
import { formateDate } from '../../lib/utils.js';

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
    trigger.addEventListener('click', () => {
      const folder = JSON.parse(trigger.dataset.folder || null);
      showModal({ modal, folder });
    });
  });

  closeButton.addEventListener('click', () => {
    hideModal({ modal });
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
      console.log('Has folder');
      isCreate = false;
      folder = ev.detail.folder;
      formTitle.textContent = 'Rename folder';
      submitButton.textContent = 'Update';
      parentFolderIdInput.value = folder.parentFolderId || '';
      nameInput.value = folder.name;
    } else {
      console.log('No folder');
      isCreate = true;
      folder = null;
      formTitle.textContent = 'Create folder';
      submitButton.textContent = 'Create';
      parentFolderIdInput.value = '';
      nameInput.value = '';
    }

    nameInput.focus();
  });

  // Remove error info while user typing
  nameInput.addEventListener('input', () => {
    removeErrorStylesAndMessages(nameInput);
  });

  // Client-side validation
  form.addEventListener('submit', handleSubmit);

  // Clear the nameInput value when the modal is about to close
  document.addEventListener('folder-form-modal-hidden', () => {
    nameInput.value = '';
    removeErrorStylesAndMessages(nameInput);
  });

  async function handleSubmit(ev) {
    ev.preventDefault();

    if (isSubmitting) return;

    // 1. Client-side validation
    if (!validateField(nameInput)) {
      focusOnFirstErrorField(form);
      return;
    }

    const formData = new FormData(form);
    const payload = {
      name: formData.get('name'),
      parentFolderId: formData.get('parentFolderId'),
    };

    // 2. Setup UI state
    const originalButtonText = isCreate ? 'Create' : 'Update';
    submitButton.textContent = isCreate ? 'Creating...' : 'Updating...';
    submitButton.disabled = true;
    nameInput.disabled = true;
    isSubmitting = true;

    try {
      // 3. Determine endpoint and method dynamically
      const url = isCreate ? '/folders' : `/folders/${folder.id}`;
      const method = isCreate ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // 4. Handle errors
      if (!res.ok) {
        // Show validation error
        if (data.errors?.name) {
          showErrorStylesAndMessages(nameInput, data.errors.name.msg);
          focusOnFirstErrorField(form);
          return;
        }

        // Other server errors
        throw new Error(data.message || 'An error occurred');
      }

      // 5. SUCCESS - NO RELOADING
      if (isCreate) {
        addFolderItemToUI(data.folder);
        console.log('New folder added: ', data.folder.id, data.folder.name);
      } else {
        updateFolderUI(data.folder);
        console.log('Folder updated:', data.folder.id);
      }

      hideModal({ modal });
      form.reset(); // Reset form only on success
      showToast(data.message, 'success');
    } catch (error) {
      console.error('Error: ', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Network error. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      // 6. Cleanup
      isSubmitting = false;
      nameInput.disabled = false;
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }

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
})();

function updateFolderUI(folder) {
  const item = document.querySelector(`a[href="/folders/${folder.id}"]`);
  const modal = document.querySelector('#folder-details-modal');

  // 1. update folder name and button dataset
  if (item) {
    item.querySelector('.folder-name').textContent = folder.name;

    const button = item.querySelector('button.folder-details-modal-trigger');
    if (button) {
      button.dataset.folder = JSON.stringify(folder);
    } else {
      console.log('No button');
    }
  }

  // 2. update folder details modal
  if (modal) {
    modal.querySelector('.folder-updated-date').textContent = formateDate(
      folder.updatedAt,
    );

    modal.querySelector('.folder-form-modal-trigger').dataset.folder =
      JSON.stringify(folder);

    modal.querySelector('.share-modal-trigger').dataset.folder =
      JSON.stringify(folder);

    modal.querySelector('.delete-folder-btn').dataset.folder =
      JSON.stringify(folder);
  }
}

function addFolderItemToUI(folder) {
  const newItem = getFolderItem(folder);
  const button = newItem.querySelector('button');

  button.addEventListener('click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    const modal = document.querySelector('#folder-details-modal');
    const breadcrumbs = JSON.parse(button.dataset.breadcrumbs);

    showModal({ modal, folder, breadcrumbs });
  });

  document.querySelector('#layout-container').prepend(newItem);
}
