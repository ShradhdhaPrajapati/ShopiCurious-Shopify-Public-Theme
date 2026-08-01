/**
 * ShopziCurious Theme - Collection Dynamic Filtering Web Component (collection.js)
 * Purpose: Custom Element (<collection-filters>) for faceted search & filter updates,
 * price slider controls, sorting dropdowns, and dynamic AJAX product grid replacement.
 */

(function () {
  'use strict';

  class CollectionFilters extends HTMLElement {
    constructor() {
      super();
      this.filterForm = this.querySelector('form');
      if (this.filterForm) {
        this.filterForm.addEventListener('input', ShopziCurious.helpers.debounce(this.onFilterChange.bind(this), 500));
        this.filterForm.addEventListener('submit', (e) => e.preventDefault());
      }
    }

    onFilterChange() {
      const formData = new FormData(this.filterForm);
      const searchParams = new URLSearchParams(formData).toString();
      this.renderSection(searchParams);
    }

    async renderSection(searchParams) {
      const sectionId = this.dataset.id;
      const url = `${window.location.pathname}?${searchParams}`;

      try {
        const html = await ShopziCurious.helpers.fetchSectionHTML(sectionId, searchParams);
        if (html) {
          const gridTarget = document.getElementById('ProductGridContainer');
          const newGrid = html.querySelector('#ProductGridContainer');
          if (gridTarget && newGrid) {
            gridTarget.innerHTML = newGrid.innerHTML;
          }
          window.history.pushState({ path: url }, '', url);
        }
      } catch (error) {
        console.error('[ShopziCurious Collection Filter Error]', error);
      }
    }
  }

  ShopziCurious.defineCustomElement('collection-filters', CollectionFilters);
})();
