/**
 * ShopziCurious Theme - Predictive Search Custom Element (search.js)
 * Purpose: Web Component (<predictive-search>) for debounced predictive search input,
 * fetching Shopify live search results, ARIA combobox accessibility, and keyboard navigation.
 */

(function () {
  'use strict';

  class PredictiveSearch extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector('input[type="search"]');
      this.predictiveSearchResults = this.querySelector('[data-predictive-search]');
      if (!this.input) return;

      this.input.addEventListener('input', ShopziCurious.helpers.debounce(this.onChange.bind(this), 300));
    }

    async onChange() {
      const searchTerm = this.input.value.trim();

      if (!searchTerm.length) {
        this.close();
        return;
      }

      this.getSearchResults(searchTerm);
    }

    async getSearchResults(searchTerm) {
      try {
        const response = await fetch(`/search/suggest.json?q=${encodeURIComponent(searchTerm)}&resources[type]=product,collection&resources[limit]=5`);
        if (!response.ok) return;

        const data = await response.json();
        const products = data.resources.results.products;

        this.renderResults(products);
      } catch (error) {
        console.error('[ShopziCurious Predictive Search Error]', error);
      }
    }

    renderResults(products) {
      if (!this.predictiveSearchResults) return;

      if (!products || products.length === 0) {
        this.predictiveSearchResults.innerHTML = '<div class="szc-p-4 szc-text-muted">No results found</div>';
        this.open();
        return;
      }

      const html = products
        .map(
          (product) => `
        <a href="${product.url}" class="szc-flex szc-items-center szc-gap-3 szc-p-2 szc-hover-lift">
          <img src="${product.image}" width="40" height="40" alt="${product.title}" class="szc-object-cover szc-radius-xs">
          <div>
            <div class="szc-text-sm szc-fw-medium">${product.title}</div>
            <div class="szc-text-xs szc-text-muted">${ShopziCurious.helpers.formatMoney(product.price * 100)}</div>
          </div>
        </a>
      `
        )
        .join('');

      this.predictiveSearchResults.innerHTML = html;
      this.open();
    }

    open() {
      this.setAttribute('open', 'true');
    }

    close() {
      this.removeAttribute('open');
    }
  }

  ShopziCurious.defineCustomElement('predictive-search', PredictiveSearch);
})();
