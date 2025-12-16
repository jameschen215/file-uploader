import {
  focusOnFirstErrorField,
  removeErrorStylesAndMessages,
  validateAuthField,
  validateAuthFromServer,
} from './lib/validation-helpers.js';
import { handlePasswordTogglesDisplayAndAction } from './lib/dom-helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#sign-in-form');

  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const firstInput = form.querySelector('input');
  const signUpLink = form.querySelector('p a');
  // const pswInput = form.querySelector('#password');
  const pswToggle = form.querySelector('.toggle-psw');
  let isSubmitting = false;

  // 1. handle password show/hide button appearance and action
  handlePasswordTogglesDisplayAndAction([pswToggle]);

  // 2. focus on the first input
  firstInput.focus();

  // 3. server-side validation
  validateAuthFromServer(form);

  // 4. client-side validation
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();

    if (isSubmitting) return; // prevent duplicate submissions

    try {
      let isValid = true;

      form.querySelectorAll('input').forEach((field) => {
        if (!validateAuthField(field)) {
          isValid = false;
        }
      });

      if (isValid) {
        isSubmitting = true;

        updateUIOnSubmit();

        // manually submit only if valid
        form.submit();
      } else {
        focusOnFirstErrorField(form);
      }

      isSubmitting = false;
    } catch (error) {
      console.error(error);
      isSubmitting = false;
    }
  });

  // 5. remove error info while user typing
  form.querySelectorAll('input').forEach((field) => {
    field.addEventListener('input', () => removeErrorStylesAndMessages(field));
  });

  function updateUIOnSubmit() {
    pswToggle.disabled = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';
    signUpLink.classList.add(
      'pointer-events-none',
      'text-zinc-400',
      'cursor-default',
    );
  }
});
