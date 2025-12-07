import { MAX_FOLDER_NAME } from '../../lib/constants.js';
import { hideModal, showModal } from '../../lib/modal-helpers.js';
import {
  focusOnFirstErrorField,
  removeErrorStylesAndMessages,
  showErrorStylesAndMessages,
} from '../../lib/validation-helpers.js';
import { showToast } from '../toast.js';

import { getFolderCard } from '../../partials/template.js';
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

    // 2. Store original state for rollback (UPDATE only)
    let folderDetailsModal = null;
    let nameElementInModal = null;
    let originalName = null;

    if (!isCreate) {
      folderDetailsModal = document.querySelector('#folder-details-modal');

      if (folderDetailsModal) {
        nameElementInModal = folderDetailsModal.querySelector('.folder-name');
        if (nameElementInModal) {
          originalName = folder.name;

          // OPTIMISTIC UPDATE - Update UI immediately
          nameElementInModal.textContent = payload.name;
          console.log('Optimistically updated modal to:', payload.name);
        }
      }
    }

    // 3. Setup UI state
    const originalButtonText = isCreate ? 'Create' : 'Update';
    submitButton.textContent = isCreate ? 'Creating...' : 'Updating...';
    submitButton.disabled = true;
    nameInput.disabled = true;
    isSubmitting = true;

    try {
      // 4. Determine endpoint and method dynamically
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

      // 5. Handle errors
      if (!res.ok) {
        console.log('Request failed - rolling back modal...');

        // ROLLBACK optimistic update on error
        if (!isCreate && nameElementInModal && originalName) {
          nameElementInModal.textContent = originalName;
          console.log('Rolled back modal to:', originalName);
        }

        // Show error message
        if (data.errors?.name) {
          showErrorStylesAndMessages(nameInput, data.errors.name.msg);
          focusOnFirstErrorField(form);
        } else {
          showToast(data.message || 'An error occurred.');
        }
        return;
      }

      // 6. SUCCESS - NO RELOADING
      form.reset();
      hideModal({ modal });

      if (isCreate) {
        // For creation, add new element
        addFolderItemToUI(data.folder);
        showToast('Folder created successfully!');
        console.log('New folder added: ', data.folder.id);
      } else {
        // For update, optimistic UI already done, just confirm
        // Update any other fields if needed (like updatedAt, etc.)
        updateFolderItemInUI(data.folder);
        showToast('Folder updated successfully!');
        console.log('Folder updated:', data.folder.id);
      }
    } catch (error) {
      console.error('Network error: ', error);

      // ROLLBACK optimistic update on network error
      if (!isCreate && nameElementInModal && originalName) {
        nameElementInModal.textContent = originalName;
        console.log('Rolled back modal to:', originalName);
      }

      showToast('Network error. Please try again.');
    } finally {
      // 7. Cleanup
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

function updateFolderItemInUI(folder) {
  const item = document.querySelector(`a[href="/folders/${folder.id}"]`);
  const folderDetailsModal = document.querySelector('#folder-details-modal');

  // 1. update folder name
  if (item) {
    item.querySelector('.folder-name').textContent = folder.name;
  }

  // 2. update folder details modal
  if (folderDetailsModal) {
    folderDetailsModal.querySelector('.folder-updated-date').textContent =
      formateDate(folder.updatedAt);
  }
}

function addFolderItemToUI(folder) {
  const newItem = getFolderCard(folder);
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
