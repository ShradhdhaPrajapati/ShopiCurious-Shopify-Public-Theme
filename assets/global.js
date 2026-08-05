/**
 * ShopziCurious Theme - Global Namespace & Core Architecture (global.js)
 * Purpose: Central Javascript namespace, Custom Element registry manager,
 * PubSub event bus, trapFocus accessibility utility, and theme global state.
 */

(function () {
  'use strict';

  // Initialize Global Namespace
  window.ShopziCurious = window.ShopziCurious || {};
  window.Kaizen = window.ShopziCurious; // Backward alias
  window.SZC = window.ShopziCurious;

  /**
   * Safe Custom Element Registrar
   * Prevents re-registration errors during theme editor live reload.
   */
  ShopziCurious.defineCustomElement = function (name, constructorClass) {
    if (!customElements.get(name)) {
      customElements.define(name, constructorClass);
    }
  };

  /**
   * Global Event PubSub System (Publish / Subscribe)
   * Facilitates decoupled component communication (e.g. Cart update -> Header count update).
   */
  class PubSubManager {
    constructor() {
      this.events = {};
    }

    subscribe(eventName, fn) {
      this.events[eventName] = this.events[eventName] || [];
      this.events[eventName].push(fn);
      return () => this.unsubscribe(eventName, fn);
    }

    unsubscribe(eventName, fn) {
      if (this.events[eventName]) {
        this.events[eventName] = this.events[eventName].filter((sub) => sub !== fn);
      }
    }

    publish(eventName, data = {}) {
      if (this.events[eventName]) {
        this.events[eventName].forEach((fn) => {
          try {
            fn(data);
          } catch (error) {
            console.error(`[ShopziCurious PubSub Error] Event: ${eventName}`, error);
          }
        });
      }
    }
  }

  ShopziCurious.pubsub = new PubSubManager();
  ShopziCurious.events = {
    CART_UPDATED: 'cart:updated',
    CART_OPEN: 'cart:open',
    CART_CLOSE: 'cart:close',
    VARIANT_CHANGE: 'variant:change',
    DRAWER_TOGGLE: 'drawer:toggle',
    SEARCH_OPEN: 'search:open',
  };

  /**
   * Accessibility Helper - Focus Trap
   * Locks keyboard TAB navigation inside modal dialogs and slide-out drawers.
   */
  ShopziCurious.trapFocus = function (container, elementToFocus = null) {
    const focusableElements = Array.from(
      container.querySelectorAll(
        'summary, a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (!firstFocusable) return;

    if (elementToFocus) {
      elementToFocus.focus();
    } else {
      firstFocusable.focus();
    }

    container._focusTrapHandler = function (e) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', container._focusTrapHandler);
  };

  /**
   * Accessibility Helper - Remove Focus Trap
   */
  ShopziCurious.removeTrapFocus = function (container, elementToRestore = null) {
    if (container && container._focusTrapHandler) {
      document.removeEventListener('keydown', container._focusTrapHandler);
      delete container._focusTrapHandler;
    }
    if (elementToRestore) {
      elementToRestore.focus();
    }
  };

  /**
   * Global Theme Init Listener & Event Binding
   */
  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('szc-js-loaded');

    // Bind Cart Triggers Globally (Redirect to /cart if cartType == 'page')
    document.addEventListener('click', (e) => {
      const cartBtn = e.target.closest('.szc-cart-trigger');
      if (cartBtn) {
        e.preventDefault();
        const cartType = (window.ShopziCurious && window.ShopziCurious.settings && window.ShopziCurious.settings.cartType) ? window.ShopziCurious.settings.cartType : 'drawer';
        if (cartType === 'page') {
          window.location.href = (window.ShopziCurious && window.ShopziCurious.routes && window.ShopziCurious.routes.cart_url) ? window.ShopziCurious.routes.cart_url : '/cart';
        } else {
          ShopziCurious.pubsub.publish(ShopziCurious.events.CART_OPEN);
        }
      }
    });

    // Global Quick Add Handler (Supports Grid View, List View, Product Cards, Recommendations)
    document.addEventListener('click', async (e) => {
      const quickAddBtn = e.target.closest('.szc-quick-add-btn, [data-quick-add]');
      if (quickAddBtn) {
        e.preventDefault();
        const variantId = quickAddBtn.dataset.variantId || quickAddBtn.dataset.id;
        if (!variantId) return;

        quickAddBtn.classList.add('szc-btn--loading');

        try {
          const res = await fetch('/cart/add.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ items: [{ id: parseInt(variantId, 10), quantity: 1 }] })
          });

          const data = await res.json();
          const cartRes = await fetch('/cart.js');
          const cartData = await cartRes.json();

          const cartType = (window.ShopziCurious && window.ShopziCurious.settings && window.ShopziCurious.settings.cartType) ? window.ShopziCurious.settings.cartType : 'drawer';

          if (cartType === 'page') {
            window.location.href = (window.ShopziCurious && window.ShopziCurious.routes && window.ShopziCurious.routes.cart_url) ? window.ShopziCurious.routes.cart_url : '/cart';
          } else {
            ShopziCurious.pubsub.publish(ShopziCurious.events.CART_UPDATED, { item: data, item_count: cartData.item_count, openDrawer: true });
          }
        } catch (err) {
          console.error('[ShopziCurious Quick Add Error]', err);
        } finally {
          quickAddBtn.classList.remove('szc-btn--loading');
        }
      }
    });

    // Bind Skip to Content Smooth Scroll & Focus
    document.addEventListener('click', (e) => {
      const skipLink = e.target.closest('.szc-skip-to-content, .szc-skip-link');
      if (skipLink) {
        const targetId = skipLink.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          const mainContent = document.querySelector(targetId);
          if (mainContent) {
            e.preventDefault();
            mainContent.scrollIntoView({ behavior: 'smooth' });
            mainContent.focus({ preventScroll: true });
          }
        }
      }
    });

    // Update Cart Badge on CART_UPDATED or cart:updated
    const updateCartBadges = async (cartData) => {
      try {
        let count = (cartData && typeof cartData.item_count !== 'undefined') ? cartData.item_count : undefined;
        if (typeof count === 'undefined') {
          const res = await fetch('/cart.js');
          const cart = await res.json();
          count = cart.item_count;
        }
        const badges = document.querySelectorAll('.szc-header__cart-badge, [data-cart-count], .szc-header__cart-count');
        badges.forEach((badge) => {
          badge.textContent = count;
          badge.setAttribute('data-cart-count', count);
        });
      } catch (err) {
        console.error('Failed to update cart badge:', err);
      }
    };

    ShopziCurious.pubsub.subscribe(ShopziCurious.events.CART_UPDATED, updateCartBadges);
    ShopziCurious.pubsub.subscribe('cart:updated', updateCartBadges);
  });
})();
