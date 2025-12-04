export function generateFileItem(file) {
  return `
    <div
      id="file-details-trigger-${file.id}"
      role="button"
      tabindex="0"
      data-file=${JSON.stringify(file)}
      class="file-details-modal-trigger item group w-full h-40 flex flex-col items-center justify-center gap-2 rounded-md cursor-pointer group-hover:border-sky-200 dark:group-hover:border-sky-800 group-hover:bg-sky-50 dark:group-hover:bg-sky-950 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 focus-visible:border-none focus-visible:outline-none dark:ring-offset-gray-900"
    >
      <div
        class="item-icon-wrapper w-full flex-grow flex items-center justify-center border rounded-md border-gray-200 dark:border-gray-800"
      >
        <span aria-hidden="true" class="item-icon block size-14 text-sky-400">
          ${getIcon(file.mimeType)}
        </span>
      </div>

      <div class="item-info relative w-full text-center">
        <span class="text-sm inline-block w-[calc(100%-24px)] mx-auto truncate">
          ${file.originalName}
        </span>
      </div>
    </div>
  `;
}

export function generateFolderItem(folder) {
  return `
    <a
      href="/folders/${folder.id}"
      class="group w-full h-40 flex flex-col items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 focus-visible:border-none focus-visible:outline-none dark:ring-offset-gray-900 rounded-md"
    >

      <div
        class="group-focus:bg-sky-100 group-focus:dark:bg-sky-950 w-full flex-grow flex items-center justify-center border rounded-md border-gray-200 dark:border-gray-800"
      >
        <span aria-hidden="true" class="block text-sky-400">
         ${icon({ name: 'Folder', fill: 'currentColor', size: 56 })}
        </span>
      </div>

      <div class="item-info relative w-full text-center">
        <span class="text-sm inline-block w-[calc(100%-24px)] mx-auto truncate">
          ${folder.name}
        </span>
        <button
          id="folder-details-trigger-${folder.id}"
          type="button"
          aria-expanded="false"
          data-folder=${JSON.stringify(folder)}
          class="folder-details-modal-trigger item-info-btn absolute top-1/2 right-0 -translate-y-1/2 py-1 px-0.5 rounded-sm text-gray-500 sm:opacity-0 opacity-100 group-hover:opacity-100 hover:dark:bg-gray-800 hover:bg-gray-100 transition-all focus-visible:opacity-100 focus-visible:p-0 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none focus-visible:border-none"
        >
          ${icon({ name: 'EllipsisVertical' })}
        </button>
      </div>
    </a>
  `;
}
