/**
 * ShopziCurious Theme - Sticky Header Web Component (header.js)
 * Purpose: Custom Element <sticky-header> for real-time scroll handling,
 * sticky elevation effect, and performance-optimized state management.
 */

(function () {
  'use strict';

  class StickyHeader extends HTMLElement {
    constructor() {
      super();
      this.onScrollHandler = this.onScroll.bind(this);
    }

    connectedCallback() {
      window.addEventListener('scroll', this.onScrollHandler, { passive: true });
      this.onScroll();
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScrollHandler);
    }

    onScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (this.classList.contains('is-sticky')) {
        if (scrollTop > 15) {
          this.classList.add('is-scrolled');
        } else {
          this.classList.remove('is-scrolled');
        }
      }
    }
  }

  if (window.ShopziCurious && window.ShopziCurious.defineCustomElement) {
    window.ShopziCurious.defineCustomElement('sticky-header', StickyHeader);
  } else if (!customElements.get('sticky-header')) {
    customElements.define('sticky-header', StickyHeader);
  }
})();
