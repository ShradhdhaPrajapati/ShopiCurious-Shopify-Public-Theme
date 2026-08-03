/**
 * ShopziCurious Theme - Sticky Header & Navigation Custom Element (header.js)
 * Purpose: Web Component for sticky header animation on scroll, scroll-direction detection,
 * mobile drawer trigger controls, and accessible menu navigation.
 */

(function () {
  'use strict';

  class StickyHeader extends HTMLElement {
    constructor() {
      super();
      this.headerBounds = {};
      this.currentScrollTop = 0;
      this.preventReveal = false;
      this.predictiveSearch = this.querySelector('predictive-search');
      this.onScrollHandler = this.onScroll.bind(this);
    }

    connectedCallback() {
      this.header = this.querySelector('.szc-header');
      this.headerBounds = this.getBoundingClientRect();
      window.addEventListener('scroll', this.onScrollHandler, false);
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScrollHandler);
    }

    onScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
        // Scrolling Down -> Hide Header
        requestAnimationFrame(this.hide.bind(this));
      } else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
        // Scrolling Up -> Reveal Sticky Header
        requestAnimationFrame(this.reveal.bind(this));
      } else if (scrollTop <= this.headerBounds.bottom) {
        // Reset to top position
        requestAnimationFrame(this.reset.bind(this));
      }

      this.currentScrollTop = scrollTop;
    }

    hide() {
      if (this.preventReveal) return;
      this.classList.add('szc-header--hidden', 'szc-header--sticky');
      this.classList.remove('szc-header--visible');
    }

    reveal() {
      if (this.preventReveal) return;
      this.classList.add('szc-header--sticky', 'szc-header--visible');
      this.classList.remove('szc-header--hidden');
    }

    reset() {
      this.classList.remove('szc-header--hidden', 'szc-header--sticky', 'szc-header--visible');
    }
  }

  ShopziCurious.defineCustomElement('sticky-header', StickyHeader);
})();
