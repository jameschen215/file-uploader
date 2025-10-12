// import { showClearButton, hideClearButton } from './lib/search-helpers.js';

// document.addEventListener('search-modal-open', () => {
//   const modal = document.querySelector('#search-modal');
//   const form = document.querySelector('#search-form');
//   const searchInput = document.querySelector('input#search');
//   const clearButton = document.querySelector('#search-form > button');

//   if (!modal || !form || !searchInput || !clearButton) return;

//   hideClearButton(clearButton);

//   // 1. Focus on search input
//   searchInput.focus();

//   // Force repaint - multiple methods to ensure it works
//   // in case that the cursor is not blinking
//   requestAnimationFrame(() => {
//     searchInput.style.transform = 'translateZ(0)';
//     requestAnimationFrame(() => {
//       searchInput.style.transform = '';
//     });
//   });

//   // 2. Handle clear button show/hide when user typing
//   // 2.1 Show the clear button on mousedown if the input has a value
//   searchInput.addEventListener('mousedown', () => {
//     if (searchInput.value.trim() !== '') {
//       showClearButton(clearButton);
//     }
//   });

//   // 2.2 Show the clear button while the user is typing (hide when input is empty)
//   searchInput.addEventListener('input', function () {
//     if (this.value.trim() === '') {
//       hideClearButton(clearButton);
//     } else {
//       showClearButton(clearButton);
//     }
//   });

//   // 2.3 Hide clear button when input loses focus
//   searchInput.addEventListener('blur', () => {
//     if (searchInput.value.trim() === '') {
//       hideClearButton(clearButton);
//     }
//   });

//   // 3. Clear the input when clear button is clicked
//   // 3.1 Prevent the input from blurring when the clear button is clicked.
//   // This allows the clear button's click event to fire.
//   clearButton.addEventListener('mousedown', (ev) => {
//     ev.preventDefault();
//   });

//   clearButton.addEventListener('click', (ev) => {
//     searchInput.value = '';
//     searchInput.focus();
//     hideClearButton(clearButton);
//   });

//   // 3.2 Clear the input when the modal is hidden
//   document.addEventListener('search-modal-hide', () => {
//     searchInput.value = '';
//   });

//   // 3.3 Clear the input when 'Escape' is pressed
//   document.addEventListener('keydown', (ev) => {
//     if (ev.key === 'Escape') {
//       ev.preventDefault();

//       searchInput.blur();
//     }
//   });
// });
