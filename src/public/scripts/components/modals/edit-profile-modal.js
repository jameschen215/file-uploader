import { hideModal } from '../../lib/modal-helpers.js';
import {
  focusOnFirstErrorField,
  removeErrorStylesAndMessages,
  showErrorStylesAndMessages,
} from '../../lib/validation-helpers.js';
import { showToast } from '../toast.js';

const modal = document.querySelector('#edit-profile-modal');
const form = modal.querySelector('form');
const input = modal.querySelector('input');
const closeButton = modal.querySelector('.close-modal-btn');
const submitButton = form.querySelector('button[type="submit"]');
const usernameEl = document.querySelector('#profile-heading');

let isSubmitting = false;

function handleModalOpen(ev) {
  input.value = usernameEl.textContent;

  input.focus();
}

function handleModalClose() {
  hideModal({ modal });
}

async function handleSubmit(ev) {
  ev.preventDefault();

  if (isSubmitting) return;

  // 1. Client-side username validation
  if (!validateUsernameField(input)) {
    focusOnFirstErrorField(form);
    return;
  }

  const payload = {
    name: input.value.trim(),
  };

  // 2. Setup UI state
  submitButton.textContent = 'Updating...';
  submitButton.disabled = true;
  input.disabled = true;
  isSubmitting = true;

  try {
    const url = `/users/edit-profile`;

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
      if (result.errors?.name) {
        showErrorStylesAndMessages(input, result.errors.name.msg);
        focusOnFirstErrorField(form);
        return;
      }
      throw new Error(result.message || 'An error occurred');
    }

    updateUsernameInUI(result.data.name);

    hideModal({ modal });
    form.reset();
    showToast(result.message, 'success');
  } catch (error) {
    console.error('Edit profile error: ', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Network error. Please try again.';
    showToast(errorMessage, 'error');
  } finally {
    isSubmitting = false;
    input.disabled = false;
    submitButton.disabled = false;
    submitButton.textContent = 'Update';
  }
}

function validateUsernameField(field) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = '';

  if (value.length === 0) {
    isValid = true;
    errorMessage = '';
  } else if (value.length > 20) {
    isValid = false;
    errorMessage = 'Username must be at most 20 characters long';
  } else if (!/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(value)) {
    isValid = false;
    errorMessage = 'Invalid username';
  }

  if (isValid) {
    removeErrorStylesAndMessages(field);
  } else {
    console.log('Should show error');
    showErrorStylesAndMessages(field, errorMessage);
  }

  return isValid;
}

function updateUsernameInUI(name) {
  document.querySelector('#profile-heading').textContent = name;
}

document.addEventListener('edit-profile-modal-open', handleModalOpen);

closeButton.addEventListener('click', handleModalClose);

form.addEventListener('submit', handleSubmit);

input.addEventListener('input', function () {
  removeErrorStylesAndMessages(this);
});
