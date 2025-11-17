import { hideModal } from './lib/modal-helpers.js';

(function handleShareModalVisibility() {
  const modal = document.querySelector('#share-modal');
  const closeButton = document.querySelector('#share-modal .close-modal-btn');

  if (!modal || !closeButton) return;

  closeButton.addEventListener('click', () => {
    hideModal({ modal });
  });

  // document.addEventListener('click', (ev) => {
  //   if (
  //     !ev.target.closest('#share-modal > div') &&
  //     !ev.target.closest('#share-file-btn')
  //   ) {
  //     hideModal({ modal });
  //   }
  // });
})();

document.addEventListener('share-modal-open', async (ev) => {
  console.log('Generating share link...');
  const shareEl = document.querySelector('#share-url');
  const { shareLink } = ev.detail;

  console.log({ shareLink });

  if (shareLink) {
    shareEl.value = shareLink;
  } else {
    shareEl.value = 'No share link available';
  }
});
