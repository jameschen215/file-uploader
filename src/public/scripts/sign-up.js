import { icon } from './lib/icons.js';
import {
  focusOnFirstErrorField,
  removeErrorStylesAndMessages,
  validateAuthField,
  validateAuthFromServer,
} from './lib/validation-helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#sign-up-form');

  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const firstInput = form.querySelector('input');
  const signInLink = form.querySelector('p a');
  const passwordToggles = form.querySelectorAll('.toggle-psw');

  let isSubmitting = false;

  // 1. Show toggle password icons
  passwordToggles.forEach((btn) => {
    btn.innerHTML = icon({ name: 'Eye', size: 20 });
  });

  // 2. Focus on the first input
  firstInput.focus();

  // 3. Server side validation
  validateAuthFromServer(form);

  // 4. Client side validation
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();

    if (isSubmitting) return; // prevent duplicate submissions

    let isValid = true;

    form.querySelectorAll('input').forEach((field) => {
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

    if (isValid) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing up...';
      signInLink.classList.add(
        'pointer-events-none',
        'text-gray-400',
        'cursor-default',
      );

      // Manually submit only if valid
      form.submit();
    } else {
      focusOnFirstErrorField(form);
    }

    // set submitting state to false after submitting
    isSubmitting = false;
  });

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
