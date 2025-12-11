import {
  cleanUpDeletingState,
  removeElementFromDOM,
  setupDeletingState,
} from '../../lib/dom-helpers.js';
import { showToast } from '../toast.js';
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

  addFolderDeleteHandler();
});

function displayFolderInfo(folder, breadcrumbs) {
  const renameButton = folderDetailsModal.querySelector(
    '.folder-form-modal-trigger',
  );
  const shareButton = folderDetailsModal.querySelector('.share-modal-trigger');
  const deleteButton = folderDetailsModal.querySelector('.delete-folder-btn');

  folderDetailsModal.querySelector(' .folder-name').textContent = folder.name;
  folderDetailsModal.querySelector('.folder-created-date').textContent =
    formateDate(folder.createdAt);
  folderDetailsModal.querySelector('.folder-updated-date').textContent =
    formateDate(folder.updatedAt);

  folderDetailsModal.querySelector('.folder-path').innerHTML =
    breadcrumbs.length === 0
      ? `<a href="/" class="font-medium text-sky-500 rounded-sm focus-visible:outline-none focus-visible:border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-900">Cloud drive</a>`
      : `<a href="/" class="font-medium text-sky-500 rounded-sm focus-visible:outline-none focus-visible:border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-900">Cloud drive</a> &#x203A; ` +
        breadcrumbs
          .map(
            (bc) =>
              `<a href="/folders/${bc.id}" class="font-medium text-sky-500 rounded-sm focus-visible:outline-none focus-visible:border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-900">${bc.name}</a>`,
          )
          .join(' &#x203A; ');

  // Attach folder to rename modal trigger - folder-form-modal
  renameButton.dataset.folder = JSON.stringify(folder);

  // Attach folder to share modal trigger
  shareButton.dataset.folder = JSON.stringify(folder);

  // Attach folder to share modal trigger
  deleteButton.dataset.folder = JSON.stringify(folder);
}

function addFolderDeleteHandler() {
  const deleteButton = folderDetailsModal.querySelector('.delete-folder-btn');
  const folder = JSON.parse(deleteButton.dataset.folder);

  // Remove old listeners if exist
  if (currentDeleteHandler) {
    deleteButton.removeEventListener('click', currentDeleteHandler);
  }

  // Create new handlers with the current folder data
  currentDeleteHandler = async () => {
    const confirmed = await confirmDeletion({ folder });

    if (!confirmed) return;

    if (folder._count.subFolders > 0 || folder._count.files > 0) {
      showToast("Can't delete folder - it's not empty.", 'warning');
      return;
    }

    // Show loading state
    const originalButtonHTML = deleteButton.innerHTML;
    setupDeletingState(deleteButton);

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
      removeElementFromDOM(result.data.id);

      showToast(result.message, 'success');
    } catch (error) {
      console.error('Delete error: ', error);

      showToast(error.message || 'Failed to delete folder', 'error');
    } finally {
      cleanUpDeletingState(deleteButton, originalButtonHTML);
    }
  };

  // Add new listeners
  deleteButton.addEventListener('click', currentDeleteHandler);
}
