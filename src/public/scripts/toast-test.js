import { showToast } from './components/toast.js';

const successBtn = document.querySelector('#success-btn');
const errorBtn = document.querySelector('#error-btn');
const warningBtn = document.querySelector('#warning-btn');
const infoBtn = document.querySelector('#info-btn');

successBtn.addEventListener('click', () => {
  showToast(
    'Success! Operation completed Operation completed Operation completed Operation completed.',
    'success',
  );
});

errorBtn.addEventListener('click', () => {
  showToast('Error! Something went wrong.', 'error');
});

warningBtn.addEventListener('click', () => {
  showToast('Warning! Please check your input.', 'warning');
});

infoBtn.addEventListener('click', () => {
  showToast('Info! New update available.', 'info');
});
