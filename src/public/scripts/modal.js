import { handleSortInput } from './lib/sort-helpers.js';
import { handleSearchInput } from './lib/search-helpers.js';
import { handleAddInput } from './lib/add-helpers.js';
import { handleFolderInput } from './lib/folder-helpers.js';

document.addEventListener('modal-open', () => {
  const modal = document.querySelector('#modal');

  if (!modal) return;

  const content = modal.querySelector(':scope > div.flex');

  const contentName = content.id.split('-')[0];

  switch (contentName) {
    case 'add':
      handleAddInput();
      break;
    case 'sort':
      handleSortInput();
      break;
    case 'search':
      handleSearchInput();
      break;
    case 'folder':
      handleFolderInput();
      break;
  }
});
