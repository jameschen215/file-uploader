import {
  focusOnFirstErrorField,
  removeErrorStylesAndMessages,
  validateAuthField,
  validateAuthFromServer,
} from './lib/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#sign-up-form');

  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const firstInput = form.querySelector('input');
  const signInLink = form.querySelector('p a');
  let isSubmitting = false;

  // 1. Focus on the first input
  firstInput.focus();

  // 2. Server side validation
  validateAuthFromServer(form);

  // 3. Client side validation
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

  // 4. Remove error info when user is typing
  form.querySelectorAll('input').forEach((field) => {
    field.addEventListener('input', () => removeErrorStylesAndMessages(field));
  });
});
