import { icon } from './lib/get-icon.js';

document.addEventListener('DOMContentLoaded', () => {
  const layoutToggle = document.querySelector('#layout-toggle');
  const layoutContainer = document.querySelector('#layout-container');

  const savedLayout = localStorage.getItem('layout') || 'grid';
  let isGrid = savedLayout === 'grid';

  if (!layoutToggle || !layoutContainer) return;

  // Load layout
  if (isGrid) {
    console.log('Grid');
    changeLayoutToGrid();
  } else {
    console.log('List');
    changeLayoutToList();
  }

  layoutToggle.addEventListener('click', () => {
    isGrid = !isGrid;
    localStorage.setItem('layout', isGrid ? 'grid' : 'list');

    if (isGrid) {
      changeLayoutToGrid();
    } else {
      changeLayoutToList();
    }
  });

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
        'file-details-modal-trigger item group w-full h-40 flex flex-col items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 focus-visible:border-none focus-visible:outline-none dark:ring-offset-zinc-900 rounded-md transition-colors';
    });

    // 4. Modify icon size of items
    layoutContainer.querySelectorAll('.item-icon-wrapper').forEach((icon) => {
      icon.className =
        'item-icon-wrapper w-full flex-grow flex items-center justify-center border rounded-md border-zinc-200 dark:border-zinc-800 group-hover:bg-sky-50 group-hover:dark:bg-sky-950/25 group-hover:border-sky-300 group-hover:dark:border-sky-800 transition-colors';
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
        'folder-details-modal-trigger item-info-btn absolute top-1/2 right-0 -translate-y-1/2 py-1 px-0.5 rounded-md text-zinc-500 sm:opacity-0 opacity-100 group-hover:opacity-100 hover:dark:bg-zinc-800 hover:bg-zinc-100 focus-visible:opacity-100 focus-visible:p-0 focus-visible:ring-2 focus-visible:ring-offset-2  focus-visible:ring-zinc-400 focus-visible:outline-none focus-visible:border-none focus-visible:dark:ring-offset-zinc-900 transition-all';
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
        'item flex items-center gap-5 border-b border-zinc-200 py-4 dark:border-zinc-800';
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
        'item-info-btn ml-auto py-1 px-0.5 rounded-md text-zinc-500 hover:dark:text-zinc-50 hover:text-zinc-950';
      btn.innerHTML = icon({ name: 'Ellipsis' });
    });
  }
});
