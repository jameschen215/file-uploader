import { hideModal, showModal } from './lib/modal-helpers.js';
import { formateDate } from './lib/utils.js';

(function handleFolderDetailsModalActions() {
  document.addEventListener('folder-details-modal-open', (ev) => {
    console.log('Folder details is going to display here');

    const { folder, breadcrumbs } = ev.detail;

    if (!(folder && breadcrumbs)) return;

    displayFolderInfo(folder, breadcrumbs);

    addFolderActionHandlers(folder);
  });
})();

function displayFolderInfo(folder, breadcrumbs) {
  document.querySelector('#folder-name').textContent = folder.name;
  document.querySelector('#folder-created-date').textContent = formateDate(
    folder.createdAt,
  );
  document.querySelector('#folder-updated-date').textContent = formateDate(
    folder.updatedAt,
  );

  document.querySelector('#folder-path').innerHTML =
    breadcrumbs.length === 0
      ? `<a href="/" class="font-medium text-sky-500">Cloud drive</a>`
      : `<a href="/" class="font-medium text-sky-500">Cloud drive</a> &#x203A; ` +
        breadcrumbs
          .map(
            (bc) =>
              `<a href="/folders/${bc.id}" class="font-medium text-sky-500">${bc.name}</a>`,
          )
          .join(' &#x203A; ');
}

// Store handler references outside the function
let currentDeleteHandler = null;
let currentRenameHandler = null;
let currentShareHandler = null;

function addFolderActionHandlers(folder) {
  const deleteButton = document.querySelector('#delete-folder-btn');
  const renameButton = document.querySelector('#rename-folder-btn');
  const shareButton = document.querySelector('#share-folder-btn');

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
    if (!confirm(`Are you sure you want to delete ${folder.name}?`)) {
      return;
    }

    if (folder._count.subFolders > 0 || folder._count.files > 0) {
      alert('Cannot delete a non-empty folder.');
      return;
    }

    // Handle deletion
    console.log(`Deleting folder ${folder.name}...`);

    try {
      deleteButton.disabled = true;

      const res = await fetch(`/folders/${folder.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message);
        return;
      }

      const data = await res.json();
      alert(data.message);
      window.location.reload();
    } catch (error) {
      console.error('Delete error: ', error);
      alert(error.message);
    } finally {
      deleteButton.disabled = false;
    }
  };

  currentRenameHandler = async () => {
    console.log('Rename button is clicked');
    const detailsModal = document.querySelector('#folder-details-modal');

    // Close current modal
    hideModal({ modal: detailsModal });

    // Then open another folder form modal
    const formModal = document.querySelector('#folder-form-modal');

    setTimeout(() => {
      showModal({ modal: formModal, folder });
    }, 100);
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
