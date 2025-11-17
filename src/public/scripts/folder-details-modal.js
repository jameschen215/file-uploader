import { hideModal, showModal } from './lib/modal-helpers.js';

(function handleFolderDetailsModalVisibility() {
  const triggers = document.querySelectorAll('.folder-details-modal-trigger');
  const modal = document.querySelector('#folder-details-modal');
  const closeButton = document.querySelector(
    '#folder-details-modal .close-modal-btn',
  );

  if (!(triggers && modal && closeButton)) return;

  // Handle modal show / hide
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      const folder = JSON.parse(trigger.dataset.folder);
      const breadcrumbs = JSON.parse(trigger.dataset.breadcrumbs);

      showModal({ modal, folder, breadcrumbs });
    });
  });

  closeButton.addEventListener('click', () => {
    hideModal({ modal });
  });

  // Close when clicking outside the modal
  document.addEventListener('click', (ev) => {
    if (
      !ev.target.closest('#folder-details-modal > div') &&
      !ev.target.closest('[id^="folder-details-trigger"]')
    ) {
      hideModal({ modal });
    }
  });
})();

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
  document.querySelector('#folder-created-date').textContent = folder.createdAt;
  document.querySelector('#folder-updated-date').textContent = folder.updatedAt;

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
let currentDownloadHandler = null;

function addFolderActionHandlers(folder) {
  const deleteButton = document.querySelector('#delete-folder-btn');
  const renameButton = document.querySelector('#rename-folder-btn');
  const downloadButton = document.querySelector('#download-folder-btn');

  // Remove old listeners if exist
  if (currentDeleteHandler) {
    deleteButton.removeEventListener('click', currentDeleteHandler);
  }

  if (currentRenameHandler) {
    renameButton.removeEventListener('click', currentRenameHandler);
  }

  if (currentDownloadHandler) {
    downloadButton.removeEventListener('click', currentDownloadHandler);
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

  currentDownloadHandler = async () => {
    console.log('Download button is clicked');
  };

  // Add new listeners
  deleteButton.addEventListener('click', currentDeleteHandler);
  renameButton.addEventListener('click', currentRenameHandler);
  downloadButton.addEventListener('click', currentDownloadHandler);
}
