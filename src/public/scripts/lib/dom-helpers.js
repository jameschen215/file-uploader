/** --- lib/dom-helpers.js --- */

import { icon } from './get-icon.js';
import { getFileItem } from '../partials/layout-item-file-template.js';

/**
 * Loads an image with a spinner and handles error
 * @param {HTMLElement} container - Container element to render into
 * @param {string} imageSrc - Image source URL
 * @param {string} altText - Alt text for the image
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImageWithSpinner(container, imageSrc, altText) {
  // Show spinner
  showSpinner(container);

  const image = new Image();
  image.src = imageSrc;
  image.alt = altText;
  image.className = 'max-w-full h-auto';

  return new Promise((resolve, reject) => {
    image.onload = () => {
      container.innerHTML = `
        <div class="flex items-center justify-center">
          <img src="${imageSrc}" alt="${altText}" class="max-w-full h-auto" />
        </div>
      `;

      // You can just resolve, no value needed, using the side effect
      // resolve(image);
      resolve();
    };

    image.onerror = () => {
      showError(container, 'Failed to load image');
      reject(new Error('Image load failed'));
    };
  });
}

/**
 * Shows a loading spinner in a container
 * @param {HTMLElement} container
 */
export function showSpinner(container) {
  container.innerHTML = `
    <div class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 text-zinc-400/50 dark:text-zinc-500">
        ${icon({ name: 'LoaderCircle', strokeWidth: 1, className: 'w-full h-auto' })}
      </div>
    </div>
  `;
}

/**
 * Shows an error message
 * @param {HTMLElement} container
 * @param {string} message
 */

export function showError(container, message = 'An error occurred') {
  container.innerHTML = `
    <div class="flex items-center justify-center text-zinc-400 dark:text-zinc-500 w-full aspect-video border border-zinc-200 dark:border-zinc-800 p-12 rounded-md">
      <p>${message}</p>
    </div>
  `;
}

/**
 * Add files to list of file items in UI
 * @param {HTMLElement} container
 * @param {array} files
 */
export function addFileItemsToUI(container, files) {
  // Check if container is empty
  const emptyTitle = container.querySelector('h3');
  if (emptyTitle && files.length > 0) {
    container.innerHTML = '';
  }

  files.forEach((file) => {
    console.log('File: ', file.originalName, file.id);
    container.appendChild(getFileItem(file));
  });
}

/**
 * Show deleting state
 * @param {HTMLElement} button
 */
export function setupDeletingState(button) {
  // Disable all buttons
  [...button.parentElement.children].forEach((btn) => {
    btn.disabled = true;
  });

  // Show visual feedbacks
  button.parentElement.previousElementSibling.classList.add('opacity-50');
  button.innerHTML = `<span>${icon({ name: 'LoaderCircle' })}</span>`;
  button.classList.add('animate-spin');
}

/**
 * Clean up the deleting state
 * @param {HTMLElement} button
 * @param {HTMLElement} originalButtonHTML
 */
export function cleanUpDeletingState(button, originalButtonHTML) {
  [...button.parentElement.children].forEach((btn) => {
    btn.disabled = false;
  });

  button.parentElement.previousElementSibling.classList.remove('opacity-50');
  button.innerHTML = originalButtonHTML;
  button.classList.remove('animate-spin');
}

/**
 * Remove an element from DOM by id
 * @param {*} id
 */
export function removeElementFromDOM(id) {
  const el = document.querySelector(`[id$="-${id}"]`);
  if (el) {
    el.remove();
  }
}
