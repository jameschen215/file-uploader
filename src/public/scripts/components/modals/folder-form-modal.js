import { MAX_FOLDER_NAME } from '../../lib/constants.js';
import { hideModal, showModal } from '../../lib/modal-helpers.js';
import {
  focusOnFirstErrorField,
  removeErrorStylesAndMessages,
  showErrorStylesAndMessages,
} from '../../lib/validation-helpers.js';
import { showToast } from '../toast.js';

import { getFolderCard } from '../../partials/template.js';

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
    const formData = new FormData(form);
    const dataToSend = {
      name: formData.get('name'),
      parentFolderId: formData.get('parentFolderId') || null,
    };

    // (Assuming validateField checks the input element directly, which is fine)
    if (!validateField(nameInput)) {
      focusOnFirstErrorField(form);
      return;
    }

    // 2. Setup UI state
    submitButton.textContent = isCreate ? 'Creating...' : 'Updating...';
    submitButton.disabled = true;
    nameInput.disabled = true;
    isSubmitting = true;

    try {
      // 3. Determine endpoint and method dynamically
      const url = isCreate ? '/folders' : `/folders/${folder.id}`;
      const method = isCreate ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      // 4. Handle server validation errors
      if (!res.ok) {
        if (data.errors?.name) {
          showErrorStylesAndMessages(nameInput, data.errors.name.msg);
          focusOnFirstErrorField(form);
        } else {
          showToast(data.message || 'An error occurred.');
        }
        return;
      }

      // SUCCESS - NO RELOADING
      // a. reset form and modal
      form.reset();
      hideModal({ modal });

      // b. update ui manually
      if (isCreate) {
        addFolderItemToUI(data.folder);
        showToast('Folder created successfully!');
        console.log('New folder added: ', data.folder.id);
      } else {
        updateFolderItemInUI(data.folder);
        showToast('Folder updated successfully!');
      }
    } catch (error) {
      console.error('Network error: ', error);
      showToast('Network error. Please try again.');
    } finally {
      // 5. Cleanup
      nameInput.disabled = false;
      submitButton.disabled = false;
      submitButton.textContent = isCreate ? 'Create' : 'Update';
      isSubmitting = false;
    }

    // ev.preventDefault();
    // if (isSubmitting) return;
    // let isValid = true;
    // console.log({ nameInput });
    // if (!validateField(nameInput)) {
    //   isValid = false;
    // }
    // if (!isValid) {
    //   focusOnFirstErrorField(form);
    // } else {
    //   const formData = new FormData(form);
    //   // 1. Disable nameInput and submit button
    //   submitButton.textContent = isCreate ? 'Creating...' : 'Updating...';
    //   nameInput.disabled = true;
    //   submitButton.disabled = true;
    //   isSubmitting = true;
    //   let resp = null;
    //   try {
    //     if (isCreate) {
    //       resp = await fetch('/folders', {
    //         method: 'POST',
    //         body: formData,
    //       });
    //     } else {
    //       resp = await fetch(`/folders/${folder.id}`, {
    //         method: 'PUT',
    //         body: formData,
    //       });
    //     }
    //     const data = await resp.json();
    //     if (!resp.ok) {
    //       // 2. Show validation errors
    //       if (data.errors?.name) {
    //         showErrorStylesAndMessages(nameInput, data.errors.name.msg);
    //         focusOnFirstErrorField(form);
    //       }
    //       return;
    //     }
    //     // Success - reset form and hide modal
    //     form.reset();
    //     hideModal({ modal });
    //     window.location.reload();
    //   } catch (error) {
    //     console.error('Error submitting folder: ', error);
    //   } finally {
    //     // Re-enable nameInput and submit button
    //     nameInput.disabled = false;
    //     submitButton.disabled = false;
    //     submitButton.textContent = isCreate ? 'Create' : 'Update';
    //     isSubmitting = false;
    //   }
    // }
  }

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

function updateFolderItemInUI(folder) {
  const item = document.querySelector(`a[href="/folders/${folder.id}"]`);
  if (!item) return;

  // 1. update folder name
  const nameWrapper = item.querySelector('#folder-name');
  if (nameWrapper) {
    nameWrapper.textContent = folder.name;
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
