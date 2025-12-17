import { hideModal, showModal } from '../../lib/modal-helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('#share-modal');
  const closeButton = document.querySelector('#share-modal .close-modal-btn');

  const shareNameEl = document.querySelector('#share-name');
  const shareUrlEl = document.querySelector('#share-url');
  const shareErrorEl = document.querySelector('#share-error');
  const copyButton = document.querySelector('#copy-link-btn');

  if (!modal || !closeButton) return;

  document.querySelectorAll('.share-modal-trigger').forEach((trigger) => {
    trigger.addEventListener('click', function () {
      const folder = JSON.parse(this.dataset.folder || null);
      const file = JSON.parse(this.dataset.file || null);

      showModal({ modal, folder, file });
    });
  });

  // Close modal
  closeButton.addEventListener('click', () => {
    hideModal({ modal });
  });

  document.addEventListener('share-modal-open', async (ev) => {
    const { file, folder } = ev.detail;
    const item = file ? file : folder ? folder : null;

    initializeShareModal(item);

    const result = await getShareUrl(item);

    if (result.success) {
      updateShareModalWithData(result.shareUrl);
    } else {
      updateShareModalWithError(result.error);
    }
  });

  copyButton.addEventListener('click', () => {
    console.log('Copying...');

    shareUrlEl.select();
    shareUrlEl.setSelectionRange(0, 99999); // For mobile

    window.navigator.clipboard.writeText(shareUrlEl.value).then(() => {
      // Visual feedback
      const originalButtonText = copyButton.innerHTML;
      copyButton.innerHTML = '✓ Copied!';

      // Remove selection and unfocus
      shareUrlEl.blur();
      window.getSelection().removeAllRanges();

      setTimeout(() => {
        copyButton.innerHTML = originalButtonText;
      }, 2000);
    });
  });

  function initializeShareModal(item) {
    shareNameEl.textContent = item.originalName ? item.originalName : item.name;
    shareUrlEl.value = 'Generating share link...';
    shareErrorEl.textContent = '';
    copyButton.disabled = true;
  }

  function updateShareModalWithData(url) {
    shareUrlEl.value = url;
    shareErrorEl.classList.add('hidden');
    shareErrorEl.textContent = '';
    copyButton.disabled = false;
  }

  function updateShareModalWithError(error) {
    shareUrlEl.value = '';
    shareErrorEl.classList.remove('hidden');
    shareErrorEl.textContent = error;
    copyButton.disabled = false;
  }
});

async function getShareUrl(item) {
  try {
    const type = item.originalName ? 'file' : 'folder';
    let res = null;

    if (type === 'file') {
      res = await fetch(`/shares/files/${item.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (type === 'folder') {
      res = await fetch(`/shares/folders/${item.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Failed to generate share link',
      };
    }

    return { success: true, shareUrl: data.shareUrl };
  } catch (error) {
    console.error('Share error:', error);
    return { success: false, error };
  }
}
