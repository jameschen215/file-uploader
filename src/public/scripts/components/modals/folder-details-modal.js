import { formateDate } from '../../lib/utils.js';
import { confirmDeletion } from './confirm-modal.js';
import { hideModal, showModal } from '../../lib/modal-helpers.js';
import { showToast } from '../toast.js';

const folderDetailsModal = document.querySelector('#folder-details-modal');

// Store handler references outside the function
let currentDeleteHandler = null;
let currentRenameHandler = null;
let currentShareHandler = null;

document.addEventListener('folder-details-modal-open', (ev) => {
  console.log('Folder details is going to display here');

  const { folder, breadcrumbs } = ev.detail;

  if (!(folder && breadcrumbs)) return;

  displayFolderInfo(folder, breadcrumbs);

  addFolderActionHandlers(folder);
});

function displayFolderInfo(folder, breadcrumbs) {
  const modal = document.querySelector('#folder-details-modal');
  modal.querySelector(' .folder-name').textContent = folder.name;
  modal.querySelector('.folder-created-date').textContent = formateDate(
    folder.createdAt,
  );
  modal.querySelector('.folder-updated-date').textContent = formateDate(
    folder.updatedAt,
  );

  modal.querySelector('.folder-path').innerHTML =
    breadcrumbs.length === 0
      ? `<a href="/" class="font-medium text-sky-500 rounded-sm focus-visible:outline-none focus-visible:border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:focus-visible:ring-offset-gray-900">Cloud drive</a>`
      : `<a href="/" class="font-medium text-sky-500 rounded-sm focus-visible:outline-none focus-visible:border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:focus-visible:ring-offset-gray-900">Cloud drive</a> &#x203A; ` +
        breadcrumbs
          .map(
            (bc) =>
              `<a href="/folders/${bc.id}" class="font-medium text-sky-500 rounded-sm focus-visible:outline-none focus-visible:border-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:focus-visible:ring-offset-gray-900">${bc.name}</a>`,
          )
          .join(' &#x203A; ');
}

function addFolderActionHandlers(folder) {
  const deleteButton = document.querySelector('.delete-folder-btn');
  const renameButton = document.querySelector('.rename-folder-btn');
  const shareButton = document.querySelector('.share-folder-btn');

  // Remove old listeners if exist
  if (currentDeleteHandler) {
    deleteButton.removeEventListener('click', currentDeleteHandler);
  }

  if (currentRenameHandler) {
    renameButton.removeEventListener('click', currentRenameHandler);
  }

  if (currentShareHandler) {
    shareButton.removeEventListener('click', currentShareHandler);
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

    // Store reference to the element ant its position BEFORE removing
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

      // 1. Remove element from UI optimistically
      if (folderItemEl) {
        folderItemEl.remove();
      }

      // 2. Request the server to remove the folder
      const res = await fetch(`/folders/${folder.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();

        // RESTORE THE ELEMENT on failure
        if (folderItemEl && parentEl) {
          if (previousEl) {
            // Insert after the previous sibling
            previousEl.after(folderItemEl);
          } else {
            // It was the first child, prepend it
            parentEl.prepend(folderItemEl);
          }
        }

        showToast(errorData.message);
        return;
      }

      const result = await res.json();

      // 1. Hide folder details modal
      hideModal({ modal: folderDetailsModal });

      // 2. SHOW TOAST FIRST
      showToast(result.message);
      console.log(result.data.id, result.data.name);

      // 3. DON'T RELOAD THE PAGE - it's slow and jarring
      // window.location.reload();
    } catch (error) {
      console.error('Delete error: ', error);

      // RESTORE THE ELEMENT on failure
      if (folderItemEl && parentEl) {
        if (previousEl) {
          // Insert after the previous sibling
          previousEl.after(folderItemEl);
        } else {
          // It was the first child, prepend it
          parentEl.prepend(folderItemEl);
        }
      }

      showToast(error.message || 'Failed to delete the folder');
    } finally {
      deleteButton.disabled = false;
    }
  };

  currentRenameHandler = async () => {
    console.log('Rename button is clicked');

    setTimeout(() => {
      const formModal = document.querySelector('#folder-form-modal');
      showModal({ modal: formModal, folder });
    }, 50);
  };

  currentShareHandler = async () => {
    console.log(`Handle share link...`);

    const detailsModal = document.querySelector('#folder-details-modal');
    const shareModal = document.querySelector('#share-modal');

    // Close current modal
    hideModal({ modal: detailsModal });

    // Then open share modal
    setTimeout(() => {
      showModal({ modal: shareModal, folder });
    }, 100);
  };

  // Add new listeners
  deleteButton.addEventListener('click', currentDeleteHandler);
  renameButton.addEventListener('click', currentRenameHandler);
  shareButton.addEventListener('click', currentShareHandler);
}
