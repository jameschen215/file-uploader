import { showToast } from './components/toast.js';
import { icon } from './lib/get-icon.js';
import {
  focusOnFirstErrorField,
  removeErrorStylesAndMessages,
  showErrorStylesAndMessages,
  validateAuthField,
  validateAuthFromServer,
} from './lib/validation-helpers.js';

const form = document.querySelector('#update-password-form');
const submitBtn = form.querySelector('button[type="submit"]');
const firstInput = form.querySelector('input');
const passwordToggles = form.querySelectorAll('.toggle-psw');

document.addEventListener('DOMContentLoaded', () => {
  let isSubmitting = false;

  // 1. Show toggle password icons
  passwordToggles.forEach((btn) => {
    btn.innerHTML = icon({ name: 'Eye', size: 20 });
  });

  // 2. Focus on the first input
  firstInput.focus();

  async function handleSubmit(ev) {
    ev.preventDefault();

    if (isSubmitting) return;

    let isValid = true;

    const inputs = form.querySelectorAll('input');

    inputs.forEach((field) => {
      if (field.name === 'confirm_password') {
        const password = form.querySelector('input[name="password"]').value;

        if (!validateAuthField(field, password)) {
          isValid = false;
        }
      } else {
        if (!validateAuthField(field)) {
          isValid = false;
        }
      }
    });

    if (!isValid) {
      focusOnFirstErrorField(form);
      return;
    }
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
          body: JSON.stringify(payload),
        },
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.errors?.old_password) {
          showErrorStylesAndMessages(
            document.querySelector('#old_password'),
            result.errors.old_password.msg,
          );
        } else if (result.errors?.new_password) {
          showErrorStylesAndMessages(
            document.querySelector('#new_password'),
            result.errors.new_password.msg,
          );
        } else if (result.errors?.confirm_new_password) {
          showErrorStylesAndMessages(
            document.querySelector('#confirm_new_password'),
            result.errors.confirm_new_password.msg,
          );
        } else {
          throw new Error(result.message || 'An error occurred');
        }

        focusOnFirstErrorField(form);
      }

      // Success
      form.reset();
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

  form.addEventListener('submit', handleSubmit);

  // 5. Remove error info when user is typing
  form.querySelectorAll('input').forEach((field) => {
    field.addEventListener('input', () => removeErrorStylesAndMessages(field));
  });

  // 6. handle password buttons clicked
  passwordToggles.forEach((btn) => {
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();

      // Get password input
      const pswInput = btn.closest('div.relative').querySelector('input');

      if (pswInput) {
        // Get the current type of the input
        const type =
          pswInput.getAttribute('type') === 'password' ? 'text' : 'password';

        // Toggle the type attribute
        pswInput.setAttribute('type', type);

        // Update the button's icon
        if (type === 'password') {
          btn.innerHTML = icon({ name: 'Eye', size: 20 });
          btn.setAttribute('aria-label', 'Show password.');
        } else {
          btn.innerHTML = icon({ name: 'EyeClosed', size: 20 });
          btn.setAttribute('aria-label', 'Hide password.');
        }
      }
    });
  });
});
