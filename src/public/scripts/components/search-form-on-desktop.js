import {
  attackClearButtonListeners,
  handleActionsOnSearchedItems,
  updateClearButtonVisibility,
  updateSearchInfo,
} from '../lib/search-helpers.js';

const desktopSearchForm = document.querySelector('#search-form-on-desktop');
const spinner = document.querySelector('#search-indicator');
const desktopSearchInput = document.querySelector(
  '#search-form-on-desktop input',
);
const clearButton = document.querySelector('#search-form-on-desktop > button');

const container = document.querySelector('#layout-container');

const mainContainer = document.querySelector('#main-content');
const subHeader = document.querySelector('#sub-header');

let originalContentAndStyle = null;
let submitting = false;

// 1. Save original state and register input actions on page loading
document.addEventListener('DOMContentLoaded', () => {
  handleOriginalState();

  attackClearButtonListeners(desktopSearchInput, clearButton);
  updateClearButtonVisibility(desktopSearchInput, clearButton);
});

// 2. Update search form submission
if (desktopSearchForm) {
  desktopSearchForm.addEventListener('submit', handleSubmission);
}

// 3. Handle browser back/forward buttons
window.addEventListener('popstate', handleBrowserNavigation);

// 4. Handle actions on search result items
if (container) {
  container.addEventListener('click', handleActionsOnSearchedItems);
}

/** --- Handlers --- */
async function handleOriginalState() {
  if (!container) return;

  //  No search query - we're on home page
  const nav = performance.getEntriesByType('navigation')[0];

  if (nav.type !== 'reload') {
    // Only save original state on first load, not reload
    originalContentAndStyle = {
      mainClass: mainContainer.className,
      subHeaderHTML: subHeader.innerHTML,
      subHeaderClass: subHeader.className,
      containerHTML: container.innerHTML,
      containerClass: container.className,
    };

    history.replaceState(
      { type: 'home', ...originalContentAndStyle },
      '',
      window.location.pathname,
    );
  }

  // handleClearButtonVisibility(desktopSearchInput, clearButton);
}

async function handleSubmission(ev) {
  ev.preventDefault();

  const query = desktopSearchInput.value.trim();

  if (!query) return;

  // Update UI immediately (synchronous)
  mainContainer.classList.remove('sm:mt-[176px]');
  mainContainer.classList.add('sm:mt-16');
  subHeader.className = 'h-12 flex items-center w-full max-w-7xl mx-auto px-5';
  container.classList.add('mt-12');

  try {
    submitting = true;
    updateSearchInfo({ spinner, container, submitting, counter: subHeader });

    const url = `/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!res.ok) {
      submitting = false;
      const error = `Failed to search ${query}`;
      updateSearchInfo({
        spinner,
        container,
        submitting,
        error,
        counter: subHeader,
      });
      return;
    }

    const results = await res.json();
    submitting = false;
    desktopSearchInput.value = query;

    updateSearchInfo({
      spinner,
      container,
      submitting,
      results,
      counter: subHeader,
    });

    // Save state
    history.pushState(
      {
        type: 'search',
        query: query,
        results: results,
        mainClass: mainContainer.className,
        subHeaderHTML: subHeader.innerHTML,
        subHeaderClass: subHeader.className,
        containerHTML: container.innerHTML,
        containerClass: container.className,
      },
      '',
      `/search?q=${encodeURIComponent(query)}`,
    );
  } catch (error) {
    submitting = false;
    console.error('Search error: ', error);
    updateSearchInfo({
      spinner,
      container,
      submitting,
      error: error.message,
      counter: subHeader,
    });
  }
}

function handleBrowserNavigation(ev) {
  if (ev.state) {
    if (ev.state.type === 'home') {
      // Restore home page
      mainContainer.className = ev.state.mainClass;
      subHeader.innerHTML = ev.state.subHeaderHTML;
      subHeader.className = ev.state.subHeaderClass;
      container.innerHTML = ev.state.containerHTML;
      container.className = ev.state.containerClass;

      // Clear search desktopSearchInput
      desktopSearchInput.value = '';
    } else if (ev.state.type === 'search') {
      mainContainer.className = ev.state.mainClass;
      subHeader.innerHTML = ev.state.subHeaderHTML;
      subHeader.className = ev.state.subHeaderClass;
      container.innerHTML = ev.state.containerHTML;
      container.className = ev.state.containerClass;

      desktopSearchInput.value = ev.state.query;

      updateSearchInfo({
        spinner,
        container,
        submitting: false,
        results: ev.state.results,
        counter: subHeader,
      });
    }
  } else {
    // No state - reload page
    window.location.reload();
  }

  updateClearButtonVisibility(desktopSearchInput, clearButton);
}
