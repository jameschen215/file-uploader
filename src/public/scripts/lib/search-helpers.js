import { icon } from './icons.js';

export function generateSearchItem(file) {
  return `
    <div
      id="file-details-trigger-${file.id}"
      role="button"
      tabindex="0"
      data-file=${JSON.stringify(file)}
      data-breadcrumbs=${JSON.stringify(file.breadcrumbs)}
      class="file-details-modal-trigger item group w-full h-40 flex flex-col items-center justify-center gap-2 cursor-pointer group-hover:border-sky-200 dark:group-hover:border-sky-800 group-hover:bg-sky-50 dark:group-hover:bg-sky-950 transition-colors"
    >
      <div
        class="item-icon-wrapper w-full flex-grow flex items-center justify-center border rounded-md border-gray-200 dark:border-gray-800"
      >
        <span aria-hidden="true" class="item-icon block size-14 text-sky-400">
          ${getIcon(file.mimeType)}
        </span>
      </div>

      <div class="item-info relative w-full text-center">
        <span class="text-sm inline-block w-[calc(100%-24px)] mx-auto line-clamp-1">
          ${file.originalName}
        </span>
      </div>
    </div>
  `;
}

function getIcon(type) {
  if (type.startsWith('image')) {
    return icon({
      name: 'Image',
      strokeWidth: 1,
      className: 'w-full h-auto',
    });
  } else if (type.startsWith('video')) {
    return icon({ name: 'Film', strokeWidth: 1, className: 'w-full h-auto' });
  }

  return icon({ name: 'File', strokeWidth: 1, className: 'w-full h-auto' });
}
