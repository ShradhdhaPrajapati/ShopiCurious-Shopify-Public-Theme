/**
 * ShopziCurious Theme - Scroll & Reveal Animations Controller (animations.js)
 * Purpose: High-performance IntersectionObserver animation observer for elements
 * tagged with [data-animate]. Supports fade, slide-up, scale, and staggered reveals.
 */

(function () {
  'use strict';

  class ShopziCuriousAnimateObserver {
    constructor() {
      this.observer = null;
      this.init();
    }

    init() {
      // Check for prefers-reduced-motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.revealAllInstantly();
        return;
      }

      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                this.animateElement(entry.target);
                observer.unobserve(entry.target);
              }
            });
          },
          {
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.15,
          }
        );

        this.observeElements();
      } else {
        this.revealAllInstantly();
      }
    }

    observeElements() {
      const elements = document.querySelectorAll('[data-animate]:not(.is-animated)');
      elements.forEach((el) => this.observer.observe(el));
    }

    animateElement(el) {
      const delay = el.getAttribute('data-animate-delay') || 0;
      setTimeout(() => {
        el.classList.add('is-animated');
        const animationType = el.getAttribute('data-animate') || 'fade-in';
        el.classList.add(`szc-animate-${animationType}`);
      }, parseInt(delay, 10));
    }

    revealAllInstantly() {
      const elements = document.querySelectorAll('[data-animate]');
      elements.forEach((el) => {
        el.classList.add('is-animated');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.ShopziCurious = window.ShopziCurious || {};
    window.Kaizen = window.ShopziCurious;
    ShopziCurious.animationObserver = new ShopziCuriousAnimateObserver();
  });
})();
