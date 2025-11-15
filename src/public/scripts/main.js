import { icon } from './lib/icons.js';

document.addEventListener('DOMContentLoaded', () => {
  const layoutToggle = document.querySelector('#layout-toggle');
  const layoutContainer = document.querySelector('#layout-container');

  let isGrid =
    localStorage.getItem('isGrid') !== undefined
      ? JSON.parse(localStorage.getItem('isGrid'))
      : true;

  if (layoutToggle && layoutContainer) {
    // Load layout
    console.log({ isGrid });
    if (isGrid) {
      changeLayoutToGrid();
    } else {
      changeLayoutToList();
    }

    layoutToggle.addEventListener('click', () => {
      isGrid = !isGrid;
      localStorage.setItem('isGrid', isGrid);

      if (isGrid) {
        changeLayoutToGrid();
      } else {
        changeLayoutToList();
      }
    });
  }

  function changeLayoutToGrid() {
    // 1. Modify toggle button
    // layoutToggle.setAttribute('data-layout', 'grid');
    layoutToggle.innerHTML = icon({ name: 'LayoutList' });

    // 2. Modify layout container
    layoutContainer.classList.remove('grid-cols-1');
    layoutContainer.classList.add(
      'grid-cols-2',
      'sm:grid-cols-3',
      'md:grid-cols-4',
      'lg:grid-cols-6',
      'gap-5',
    );

    // 3. Modify item className
    layoutContainer.querySelectorAll('.item').forEach((item) => {
      item.className =
        'file-details-modal-trigger item group w-full h-40 flex flex-col items-center justify-center gap-2 cursor-pointer';
    });

    // 4. Modify icon size of items

    layoutContainer.querySelectorAll('.item-icon-wrapper').forEach((icon) => {
      icon.className =
        'item-icon-wrapper group-focus:bg-sky-100 group-focus:dark:bg-sky-950 w-full flex-grow flex items-center justify-center border rounded-md border-gray-200 dark:border-gray-800';
    });

    layoutContainer
      .querySelectorAll('.item-icon-wrapper .item-icon')
      .forEach((icon) => {
        icon.className = 'item-icon block size-14 text-sky-400';
      });

    // 5. Modify className of item-info
    layoutContainer.querySelectorAll('.item .item-info').forEach((info) => {
      info.className = 'item-info relative w-full text-center';
    });

    // 6. Modify className and icon of info button
    layoutContainer.querySelectorAll('.item .item-info-btn').forEach((btn) => {
      btn.className =
        'folder-details-modal-trigger item-info-btn absolute top-1/2 right-0 -translate-y-1/2 py-1 px-0.5 rounded-sm text-gray-500 sm:opacity-0 opacity-100 group-hover:opacity-100 hover:dark:bg-gray-800 hover:bg-gray-100 transition-all duration-200';
      btn.innerHTML = icon({ name: 'EllipsisVertical' });
    });
  }

  function changeLayoutToList() {
    // 1. Modify toggle button
    // layoutToggle.setAttribute('data-layout', 'list');
    layoutToggle.innerHTML = icon({ name: 'LayoutGrid' });

    // 2. Modify layout container
    layoutContainer.classList.remove(
      'grid-cols-2',
      'sm:grid-cols-3',
      'md:grid-cols-4',
      'lg:grid-cols-6',
      'gap-5',
    );
    layoutContainer.classList.add('grid-cols-1');

    // 3. Modify item className
    layoutContainer.querySelectorAll('.item').forEach((item) => {
      item.className =
        'item flex items-center gap-5 border-b border-gray-200 py-4 dark:border-gray-800';
    });

    // 4. Modify icon size of items
    layoutContainer.querySelectorAll('.item-icon-wrapper').forEach((icon) => {
      icon.className = 'item-icon-wrapper';
    });

    layoutContainer
      .querySelectorAll('.item-icon-wrapper .item-icon')
      .forEach((icon) => {
        icon.className = 'item-icon block size-8 text-sky-400';
      });

    // 5. Modify className of item-info
    layoutContainer.querySelectorAll('.item .item-info').forEach((info) => {
      info.className = 'item-info flex-grow flex items-center justify-between';
    });

    // 6. Modify className and icon of info button
    layoutContainer.querySelectorAll('.item .item-info-btn').forEach((btn) => {
      btn.className =
        'item-info-btn ml-auto py-1 px-0.5 rounded-sm text-gray-500 hover:dark:text-gray-50 hover:text-gray-950';
      btn.innerHTML = icon({ name: 'Ellipsis' });
    });
  }
});
