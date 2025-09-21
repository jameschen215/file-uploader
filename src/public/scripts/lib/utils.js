import { MAX_NAME_LENGTH, MIN_PASSWORD_LENGTH } from './constants.js';

// Validate from server side
export function validateAuthFromServer(form) {
  const errors = JSON.parse(form.dataset.errors);

  // Return if no errors
  if (!errors || Object.keys(errors).length === 0) return;

  // show error styles and messages
  for (const [name, error] of Object.entries(errors)) {
    const field = document.querySelector('#'.concat(name));

    showErrorStylesAndMessages(field, error.msg);
  }

  // Focus on the first error input
  focusOnFirstErrorField(form);
}

// Validate auth fields
export function validateAuthField(field, password = '') {
  const value = field.name.includes('password')
    ? field.value
    : field.value.trim();
  let isValid = true;
  let errorMessage = '';

  switch (field.name) {
    case 'name':
      if (value.length > MAX_NAME_LENGTH) {
        isValid = false;
        errorMessage = `Name must be at most ${MAX_NAME_LENGTH} characters long`;
      } else if (value && !/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(value)) {
        isValid = false;
        errorMessage = 'Invalid name';
      }
      break;

    case 'email':
      if (!value) {
        isValid = false;
        errorMessage = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value)) {
        isValid = false;
        errorMessage = 'Incorrect email address';
      }
      break;

    case 'password':
      if (!value) {
        isValid = false;
        errorMessage = 'Password is required.';
      } else if (value.length < MIN_PASSWORD_LENGTH) {
        isValid = false;
        errorMessage = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
      }
      break;

    case 'confirm_password':
      if (!value) {
        isValid = false;
        errorMessage = 'Confirm password is required';
      } else if (password !== value) {
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

export function focusOnFirstErrorField(form) {
  const firstErrorField = form.querySelector('.border-red-500');

  if (firstErrorField) {
    firstErrorField.focus();
    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

export function removeErrorStylesAndMessages(field) {
  // 1. remove error styles on field
  field.classList.remove(
    'bg-red-50',
    'border-red-500',
    'focus:ring-red-50',
    'dark:bg-red-900/10',
    'dark:border-red-500',
    'dark:focus:border-red-500',
    'dark:focus:ring-red-950',
  );
  field.classList.add(
    'border-gray-300',
    'focus:border-lime-500',
    'focus:ring-lime-50',
    'dark:focus:border-lime-500',
    'dark:focus:ring-lime-950',
  );

  // 2. Remove error message about field
  const existingErrorMessage = field.parentNode.querySelector('[id$=error]');
  if (existingErrorMessage) {
    existingErrorMessage.remove();
  }
}

function showErrorStylesAndMessages(field, message) {
  // 1. Remove existing error style and message
  removeErrorStylesAndMessages(field);

  // 2. Add new error style
  field.classList.remove(
    'border-gray-300',
    'focus:border-lime-500',
    'focus:ring-lime-50',
    'dark:focus:border-lime-500',
    'dark:focus:ring-lime-950',
  );

  field.classList.add(
    'bg-red-50',
    'border-red-500',
    'focus:ring-red-50',
    'dark:bg-red-900/10',
    'dark:border-red-500',
    'dark:focus:border-red-500',
    'dark:focus:ring-red-950',
  );

  // 3. set aria-describedby
  field.setAttribute('aria-describedby', `${field.name}-error`);

  // 4. Add new error message
  if (message) {
    const errorElement = document.createElement('p');
    errorElement.id = `${field.name}-error`;
    errorElement.className = 'text-sm text-red-600 mt-2';
    errorElement.innerHTML = message;

    field.parentNode.appendChild(errorElement);
  }
}
