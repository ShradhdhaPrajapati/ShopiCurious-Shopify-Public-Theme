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
      // Always reveal instantly inside Shopify Theme Editor preview iframe
      if ((window.Shopify && window.Shopify.designMode) || document.documentElement.classList.contains('shopify-design-mode')) {
        this.revealAllInstantly();
        this.bindShopifyEvents();
        return;
      }

      // Check for Theme Settings toggle or prefers-reduced-motion
      const themeSettings = window.ShopziCurious && window.ShopziCurious.settings;
      if (themeSettings && themeSettings.enableAnimations === false) {
        this.revealAllInstantly();
        return;
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (!themeSettings || themeSettings.respectReducedMotion !== false) {
          this.revealAllInstantly();
          return;
        }
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
            rootMargin: '0px 0px 0px 0px',
            threshold: 0.05,
          }
        );

        this.observeElements();
        this.bindShopifyEvents();
      } else {
        this.revealAllInstantly();
      }
    }

    bindShopifyEvents() {
      const handleSectionReload = () => {
        if ((window.Shopify && window.Shopify.designMode) || document.documentElement.classList.contains('shopify-design-mode')) {
          this.revealAllInstantly();
        } else {
          this.observeElements();
        }
      };

      document.addEventListener('shopify:section:load', handleSectionReload);
      document.addEventListener('shopify:section:select', handleSectionReload);
      document.addEventListener('shopify:section:reorder', handleSectionReload);
    }

    observeElements() {
      // Auto-tag any section across all pages if missing explicit data-animate
      document.querySelectorAll('.shopify-section, main > section, main > div').forEach((sec) => {
        if (!sec.hasAttribute('data-animate') && !sec.querySelector('[data-animate]')) {
          if (!sec.matches('.szc-header, .szc-announcement-bar, .cart-drawer, .quick-view-modal, .szc-zoom-modal, #ProductZoomModal, #shopify-section-header, #shopify-section-announcement-bar, .shopify-section-group-overlay-group, .section-age-verifier, .section-promo-popup')) {
            sec.setAttribute('data-animate', 'slide-up');
          }
        }
      });

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
