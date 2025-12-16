import {
  focusOnFirstErrorField,
  removeErrorStylesAndMessages,
  showErrorStylesAndMessages,
} from '../../lib/validation-helpers.js';
import { showToast } from '../toast.js';
import { hideModal } from '../../lib/modal-helpers.js';
import { MIN_PASSWORD_LENGTH } from '../../lib/constants.js';
import { handlePasswordTogglesDisplayAndAction } from '../../lib/dom-helpers.js';

const updatePswModal = document.querySelector('#update-password-modal');
const form = updatePswModal.querySelector('form');
const inputs = form.querySelectorAll('input');
const pswToggles = updatePswModal.querySelectorAll('.toggle-psw');

const submitBtn = form.querySelector('button[type="submit"]');

let isSubmitting = false;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Handle password show/hide button appearance and action
  handlePasswordTogglesDisplayAndAction(pswToggles);

  // 2. Handle modal close
  updatePswModal
    .querySelector('.close-modal-btn')
    .addEventListener('click', () => {
      hideModal({ modal: updatePswModal });
    });

  // 3. Remove error styles and message while user inputting
  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      removeErrorStylesAndMessages(input);
    });
  });

  // 4. Focus on the first input after modal open
  document.addEventListener('update-password-modal-open', () => {
    updatePswModal.querySelector('input').focus();
  });

  // 5. Reset form after modal hidden
  document.addEventListener('update-password-modal-hidden', () => {
    form.reset();
  });

  // 6. Handle form submit
  form.addEventListener('submit', handleSubmit);
});

async function handleSubmit(ev) {
  ev.preventDefault();

  if (isSubmitting) return;

  // Client-side validation
  if (!clientSideValidation(inputs)) return;

  // Get form data for submit
  const formData = new FormData(form);
  const payload = {
    old_password: formData.get('old_password'),
    new_password: formData.get('new_password'),
    confirm_new_password: formData.get('confirm_new_password'),
  };

  // Set up submitting state
  inputs.forEach((input) => {
    input.disabled = true;
  });
  submitBtn.disabled = true;
  submitBtn.textContent = 'Updating...';

  try {
    const url = '/users/update-password';
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      if (result.errors && Object.keys(result.errors).length > 0) {
        // show error styles and messages
        for (let [name, error] of Object.entries(result.errors)) {
          const field = document.querySelector('#'.concat(name));

          showErrorStylesAndMessages(field, error.msg);
        }

        focusOnFirstErrorField(form);
      } else {
        throw new Error(result.message || 'An error occurred');
      }

      return;
    }

    // Success
    form.reset();
    hideModal({ modal: updatePswModal });
    showToast(result.message, 'success');
  } catch (error) {
    console.error('Error updating password: ', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Network error. Please try again.';

    showToast(errorMessage, 'error');
  } finally {
    // Clean up submitting state
    inputs.forEach((input) => {
      input.disabled = false;
    });
    submitBtn.disabled = false;
    submitBtn.textContent = 'Update';
  }
}

function validateField(field, newPassword = '') {
  const value = field.value;

  let isValid = true;
  let errorMessage = '';

  switch (field.name) {
    case 'old_password':
      if (!value) {
        isValid = false;
        errorMessage = 'Password is required.';
      } else if (value.length < MIN_PASSWORD_LENGTH) {
        isValid = false;
        errorMessage = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
      }
      break;
    case 'new_password':
      if (!value) {
        isValid = false;
        errorMessage = 'Password is required.';
      } else if (value.length < MIN_PASSWORD_LENGTH) {
        isValid = false;
        errorMessage = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
      }
      break;

    case 'confirm_new_password':
      if (!value) {
        isValid = false;
        errorMessage = 'Confirm password is required';
      } else if (newPassword !== value) {
        isValid = false;
        errorMessage = 'Passwords do not match';
      }
      break;
  }

  if (isValid) {
    removeErrorStylesAndMessages(field);
  } else {
    showErrorStylesAndMessages(field, errorMessage);
  }

  return isValid;
}

function clientSideValidation(inputs) {
  let isValid = true;

  // Client-side validation
  inputs.forEach((input) => {
    if (input.name === 'confirm_new_password') {
      const newPassword = form.querySelector(
        'input[name="new_password"]',
      ).value;

      if (!validateField(input, newPassword)) {
        isValid = false;
      }
    } else {
      if (!validateField(input)) {
        isValid = false;
      }
    }
  });

  if (!isValid) {
    focusOnFirstErrorField(form);
  }

  return isValid;
}
