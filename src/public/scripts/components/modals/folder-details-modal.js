import { formateDate } from '../../lib/utils.js';
import { confirmDeletion } from './confirm-modal.js';
import { hideModal, showModal } from '../../lib/modal-helpers.js';
import { showToast } from '../toast.js';

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
    const confirmed = await confirmDeletion({ folder });

    if (!confirmed) return;

    if (folder._count.subFolders > 0 || folder._count.files > 0) {
      showToast('Cannot delete a non-empty folder.');
      return;
    }

    // Handle deletion
    console.log(`Deleting folder ${folder.id}...`);

    // Store reference to the element and its position BEFORE removing
    const folderItemEl = document.querySelector(
      `#layout-container a[href="/folders/${folder.id}"]`,
    );
    let previousEl = null;
    let parentEl = null;

    if (folderItemEl) {
      // Store the parent and previous sibling for restoration
      parentEl = folderItemEl.parentElement;
      previousEl = folderItemEl.previousElementSibling;
    }

    try {
      deleteButton.disabled = true;

      // 1. Remove element from UI optimistically and hide folder details modal
      if (folderItemEl) {
        folderItemEl.remove();
        hideModal({ modal: folderDetailsModal });
      }

      // 2. Request the server to remove the folder
      const res = await fetch(`/folders/${folder.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();

        // RESTORE THE ELEMENT and re-open folder details modal on failure
        if (folderItemEl && parentEl) {
          if (previousEl) {
            // Insert after the previous sibling
            previousEl.after(folderItemEl);
          } else {
            // It was the first child, prepend it
            parentEl.prepend(folderItemEl);
          }

          showModal({ modal: folderDetailsModal, folder });
        }

        showToast(errorData.message || 'Failed to delete the folder.');
        return;
      }

      const result = await res.json();

      // SHOW TOAST FIRST
      showToast(result.message);
      console.log(result.data.id, result.data.name);

      // DON'T RELOAD THE PAGE - it's slow and jarring
      // window.location.reload();
    } catch (error) {
      console.error('Delete error: ', error);

      // RESTORE THE ELEMENT and re-open folder details modal on failure
      if (folderItemEl && parentEl) {
        if (previousEl) {
          // Insert after the previous sibling
          previousEl.after(folderItemEl);
        } else {
          // It was the first child, prepend it
          parentEl.prepend(folderItemEl);
        }

        showModal({ modal: folderDetailsModal, folder });
      }

      showToast(error.message || 'Failed to delete the folder');
    } finally {
      deleteButton.disabled = false;
    }
  };

  // Add new listeners
  deleteButton.addEventListener('click', currentDeleteHandler);
}
