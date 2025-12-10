import { showToast } from '../toast.js';
import { icon } from '../../lib/get-icon.js';
import { formateDate } from '../../lib/utils.js';
import { confirmDeletion } from './confirm-modal.js';
import { hideModal } from '../../lib/modal-helpers.js';

const folderDetailsModal = document.querySelector('#folder-details-modal');

// Store handler references outside the function
let currentDeleteHandler = null;

document.addEventListener('folder-details-modal-open', (ev) => {
  const { folder, breadcrumbs } = ev.detail;

  if (!(folder && breadcrumbs)) return;

  displayFolderInfo(folder, breadcrumbs);

  addFolderDeleteHandler(folder);
});

function displayFolderInfo(folder, breadcrumbs) {
  const renameButton = folderDetailsModal.querySelector(
    '.folder-form-modal-trigger',
  );
  const shareButton = folderDetailsModal.querySelector('.share-modal-trigger');

  folderDetailsModal.querySelector(' .folder-name').textContent = folder.name;
  folderDetailsModal.querySelector('.folder-created-date').textContent =
    formateDate(folder.createdAt);
  folderDetailsModal.querySelector('.folder-updated-date').textContent =
    formateDate(folder.updatedAt);

  folderDetailsModal.querySelector('.folder-path').innerHTML =
    breadcrumbs.length === 0
      ? `<a href="/" class="font-medium text-sky-500 rounded-sm focus-visible:outline-none focus-visible:border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:focus-visible:ring-offset-gray-900">Cloud drive</a>`
      : `<a href="/" class="font-medium text-sky-500 rounded-sm focus-visible:outline-none focus-visible:border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:focus-visible:ring-offset-gray-900">Cloud drive</a> &#x203A; ` +
        breadcrumbs
          .map(
            (bc) =>
              `<a href="/folders/${bc.id}" class="font-medium text-sky-500 rounded-sm focus-visible:outline-none focus-visible:border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:focus-visible:ring-offset-gray-900">${bc.name}</a>`,
          )
          .join(' &#x203A; ');

  // Attach folder to rename modal trigger - folder-form-modal
  renameButton.dataset.folder = JSON.stringify(folder);

  // Attach folder to share modal trigger
  shareButton.dataset.folder = JSON.stringify(folder);
}

function addFolderDeleteHandler(folder) {
  const deleteButton = document.querySelector('.delete-folder-btn');

  // Remove old listeners if exist
  if (currentDeleteHandler) {
    deleteButton.removeEventListener('click', currentDeleteHandler);
  }

  // Create new handlers with the current folder data
  currentDeleteHandler = async () => {
    const originalButtonHTML = deleteButton.innerHTML;

    const confirmed = await confirmDeletion({ folder });

    if (!confirmed) return;

    if (folder._count.subFolders > 0 || folder._count.files > 0) {
      showToast("Can't delete folder - it's not empty.", 'warning');
      return;
    }

    // Show loading state
    showDeletingState(deleteButton);

    try {
      const res = await fetch(`/folders/${folder.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to delete folder.');
      }

      const result = await res.json();

      hideModal({ modal: folderDetailsModal });
      removeFolderItemFromUI(result.data.id);

      showToast(result.message, 'success');
    } catch (error) {
      console.error('Delete error: ', error);

      showToast(error.message || 'Failed to delete folder', 'error');
    } finally {
      restoreNormalState(deleteButton, originalButtonHTML);
    }
  };

  // Add new listeners
  deleteButton.addEventListener('click', currentDeleteHandler);
}

function showDeletingState(button) {
  // Disable all buttons
  [...button.parentElement.children].forEach((btn) => {
    btn.disabled = true;
  });

  // Visual feedbacks
  button.parentElement.previousElementSibling.classList.add('opacity-50');
  button.innerHTML = `
      <span>${icon({ name: 'LoaderCircle', className: 'animate-spin' })}</span>
    `;
}

function restoreNormalState(button, btnHTML) {
  [...button.parentElement.children].forEach((btn) => {
    btn.disabled = false;
  });
  button.parentElement.previousElementSibling.classList.remove('opacity-50');
  button.innerHTML = btnHTML;
}

function removeFolderItemFromUI(folderId) {
  const folderItemEl = document.querySelector(`a[href="/folders/${folderId}"]`);
  if (folderItemEl) {
    folderItemEl.remove();
  }
}
