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
   * Universal Product Image Finder (Bulletproof)
   * Resolves the primary visible product image from any DOM node, card, section, modal, or img element.
   */
  ShopziCurious.findProductImage = function (container) {
    if (!container) {
      return document.querySelector('.szc-main-product__slider-slide.is-active img, .szc-product-card__image--primary img, #QvStageImg, .szc-image-wrapper img, img');
    }

    if (container instanceof HTMLElement && container.tagName === 'IMG') {
      return container;
    }

    if (container instanceof HTMLElement) {
      const selectors = [
        '.szc-main-product__slider-slide.is-active img',
        '.szc-main-product__slider-img',
        '#QvStageImg',
        '.szc-qv-stage-img',
        '.szc-quick-view__media img',
        '.szc-product-card__image--primary img',
        '.szc-wishlist-card__image',
        '.szc-wishlist-card img',
        '.szc-card-horizontal__image img',
        '.szc-product-card__media-container img',
        '.szc-image-wrapper img',
        'img.szc-image',
        '.product-single__media img',
        '.product__media img',
        'img'
      ];

      for (const sel of selectors) {
        const imgs = container.querySelectorAll(sel);
        for (const img of imgs) {
          if (img && (img.src || img.getAttribute('src'))) {
            return img;
          }
        }
      }
    }

    // Fallback search across document
    return document.querySelector('.szc-main-product__slider-slide.is-active img, .szc-product-card__image--primary img, .szc-wishlist-card__image, #QvStageImg, .szc-image-wrapper img, img');
  };

  /**
   * Universal Header Cart Icon Finder (Bulletproof)
   * Dynamically locates the active Cart icon in the header at runtime.
   */
  ShopziCurious.getHeaderCartIcon = function () {
    const selectors = [
      '.szc-header__cart-badge',
      '.szc-cart-trigger',
      '.szc-header__icon-btn[href*="/cart"]',
      'header a[href*="/cart"]',
      '[data-cart-icon]',
      '[data-cart-count]',
      '.szc-header__icon-btn'
    ];

    let fallbackIcon = null;

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        if (el.closest('cart-drawer, .szc-cart-drawer, modal-dialog, [aria-hidden="true"]')) continue;

        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          if (rect.top >= 0 && rect.left >= 0 && rect.top <= window.innerHeight && rect.left <= window.innerWidth) {
            return el;
          }
          if (!fallbackIcon) {
            fallbackIcon = el;
          }
        }
      }
    }
    return fallbackIcon;
  };

  /**
   * Universal Centralized Fly-To-Cart Animation System (Guaranteed Execution)
   */
  ShopziCurious.animateFlyToCart = function (source) {
    const sourceImg = ShopziCurious.findProductImage(source);
    const cartIcon = ShopziCurious.getHeaderCartIcon();

    if (!sourceImg) {
      ShopziCurious.bounceCartBadge();
      return;
    }

    let sourceRect = sourceImg.getBoundingClientRect();
    if (sourceRect.width === 0 || sourceRect.height === 0) {
      if (source instanceof HTMLElement) {
        sourceRect = source.getBoundingClientRect();
      }
    }
    if (sourceRect.width === 0 || sourceRect.height === 0) {
      sourceRect = {
        top: window.innerHeight / 2 - 50,
        left: window.innerWidth / 2 - 50,
        width: 100,
        height: 100
      };
    }

    let cartRect = cartIcon ? cartIcon.getBoundingClientRect() : null;
    let targetX = window.innerWidth - 60;
    let targetY = 20;

    if (cartRect && cartRect.width > 0 && cartRect.height > 0) {
      targetX = cartRect.left + (cartRect.width / 2) - 20;
      targetY = Math.max(10, cartRect.top + (cartRect.height / 2) - 20);
    }

    const imgUrl = sourceImg.src || sourceImg.getAttribute('src');
    if (!imgUrl) {
      ShopziCurious.bounceCartBadge();
      return;
    }

    const flyImg = document.createElement('img');
    flyImg.src = imgUrl;
    flyImg.className = 'szc-fly-to-cart-clone';
    flyImg.style.cssText = `
      position: fixed;
      top: ${sourceRect.top}px;
      left: ${sourceRect.left}px;
      width: ${sourceRect.width}px;
      height: ${sourceRect.height}px;
      object-fit: cover;
      border-radius: 12px;
      z-index: 9999999;
      pointer-events: none;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
      transition: all 650ms cubic-bezier(0.2, 0.8, 0.2, 1);
      opacity: 0.95;
    `;

    document.body.appendChild(flyImg);
    void flyImg.offsetWidth; // force browser layout calculation

    flyImg.style.top = `${targetY}px`;
    flyImg.style.left = `${targetX}px`;
    flyImg.style.width = '40px';
    flyImg.style.height = '40px';
    flyImg.style.opacity = '0.15';
    flyImg.style.transform = 'scale(0.3) rotate(12deg)';

    setTimeout(() => {
      if (flyImg.parentNode) {
        flyImg.parentNode.removeChild(flyImg);
      }
      ShopziCurious.bounceCartBadge();
    }, 650);
  };

  /**
   * Cart Badge Bounce Helper
   */
  ShopziCurious.bounceCartBadge = function () {
    const badges = document.querySelectorAll('.szc-header__cart-badge, [data-cart-count], .szc-header__cart-count');
    badges.forEach((badge) => {
      badge.classList.remove('szc-badge-bounce');
      void badge.offsetWidth;
      badge.classList.add('szc-badge-bounce');
      setTimeout(() => {
        badge.classList.remove('szc-badge-bounce');
      }, 600);
    });
  };

  /**
   * Universal Cart Count Updater
   */
  ShopziCurious.updateCartCount = async function (count = null) {
    if (count === null) {
      try {
        const res = await fetch('/cart.js');
        const cart = await res.json();
        count = cart.item_count;
      } catch (e) {
        console.error('Failed to fetch cart count:', e);
        return;
      }
    }
    const badges = document.querySelectorAll('.szc-header__cart-badge, [data-cart-count], .szc-header__cart-count');
    badges.forEach((badge) => {
      badge.textContent = count;
      badge.setAttribute('data-cart-count', count);
    });
    ShopziCurious.bounceCartBadge();
  };

  /**
   * Toast Notification Helper
   */
  ShopziCurious.showToast = function (message, type = 'success') {
    let container = document.getElementById('ShopziCuriousToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ShopziCuriousToastContainer';
      container.className = 'szc-toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `szc-toast szc-toast--${type}`;

    const iconSvg = type === 'error'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('is-hiding');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  /**
   * Universal Dynamic Cart Page Refresh System
   * Updates Cart Page line items, subtotal, totals, and counts dynamically without page reload.
   */
  ShopziCurious.refreshCartPage = function (options = {}) {
    return new Promise(async (resolve) => {
      const mainCartPage = document.getElementById('MainCartPage');
      if (!mainCartPage) {
        resolve(false);
        return;
      }

      const currentScrollY = window.scrollY;

      try {
        let htmlText = '';

        // 1. Try Shopify Native Section Rendering API (?sections=cart)
        try {
          const jsonRes = await fetch(`/cart?sections=cart&_t=${Date.now()}`, { cache: 'no-store' });
          if (jsonRes.ok) {
            const data = await jsonRes.json();
            if (data && data.cart) {
              htmlText = data.cart;
            }
          }
        } catch (e) {
          // Fallback if JSON parse fails
        }

        // 2. Fallback to ?section_id=cart HTML response
        if (!htmlText) {
          const sectionRes = await fetch(`${window.location.pathname}?section_id=cart&_t=${Date.now()}`, { cache: 'no-store' });
          if (sectionRes.ok) {
            htmlText = await sectionRes.text();
          }
        }

        if (htmlText) {
          const parser = new DOMParser();
          const htmlDoc = parser.parseFromString(htmlText, 'text/html');
          const newCartPage = htmlDoc.getElementById('MainCartPage') || htmlDoc.querySelector('.szc-cart-page') || htmlDoc.body.firstElementChild;

          if (newCartPage) {
            mainCartPage.innerHTML = newCartPage.innerHTML;
            window.scrollTo({ top: currentScrollY, behavior: 'instant' });
            resolve(true);
            return;
          }
        }

        resolve(false);
      } catch (err) {
        console.error('[ShopziCurious] Failed to refresh cart page:', err);
        resolve(false);
      }
    });
  };

  /**
   * Global Theme Init Listener & Event Binding
   */
  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('szc-js-loaded');

    // Bind Cart Triggers Globally
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

    // Global Quick Add Handler (Supports Grid View, List View, Product Cards, Recommendations, Search, Related Products)
    document.addEventListener('click', async (e) => {
      const quickAddBtn = e.target.closest('.szc-quick-add-btn, [data-quick-add], [data-add-to-cart]');
      if (quickAddBtn) {
        e.preventDefault();
        e.stopPropagation();
        const variantId = quickAddBtn.dataset.variantId || quickAddBtn.dataset.id || quickAddBtn.getAttribute('data-variant-id');
        if (!variantId) return;

        quickAddBtn.classList.add('szc-btn--loading');

        // Find primary image inside card or nearby container
        const card = quickAddBtn.closest('.szc-product-card, .szc-card-horizontal, product-card, [data-product-id], [data-product-handle]') || quickAddBtn;

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
          if (res.status === 422 || data.status) {
            throw new Error(data.description || 'Could not add item to cart');
          }

          const cartRes = await fetch('/cart.js');
          const cartData = await cartRes.json();

          // Animate fly to cart using shared helper (guaranteed execution)
          ShopziCurious.animateFlyToCart(card);

          // Publish CART_UPDATED event with openDrawer: false (stay on page)
          ShopziCurious.pubsub.publish(ShopziCurious.events.CART_UPDATED, { item: data, item_count: cartData.item_count, openDrawer: false });

          // Toast notification
          if (ShopziCurious.showToast) {
            ShopziCurious.showToast('Added to cart');
          }
        } catch (err) {
          console.error('[ShopziCurious Quick Add Error]', err);
          if (ShopziCurious.showToast) {
            ShopziCurious.showToast(err.message || 'Could not add item to cart', 'error');
          }
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

    // Universal Add to Cart Form Interceptor (Product page, templates, custom forms)
    document.addEventListener('submit', async (e) => {
      const form = e.target;
      if (!form) return;

      const action = form.getAttribute('action') || form.action || '';
      if (!action.includes('/cart/add')) return;

      e.preventDefault();
      e.stopPropagation();

      const submitBtn = form.querySelector('[type="submit"], [name="add"], .szc-main-product__add-btn');
      if (submitBtn && submitBtn.classList.contains('szc-btn--loading')) return;

      if (submitBtn) {
        submitBtn.classList.add('szc-btn--loading');
        submitBtn.setAttribute('aria-disabled', 'true');
      }

      const cardOrSection = form.closest('.szc-main-product, .szc-product-card, .szc-card-horizontal, .product-single, [data-section-id]') || form;

      try {
        const formData = new FormData(form);
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
          },
          body: formData
        });

        const data = await res.json();
        if (res.status === 422 || data.status) {
          throw new Error(data.description || 'Could not add item to bag');
        }

        const cartRes = await fetch('/cart.js');
        const cartData = await cartRes.json();

        // Trigger fly-to-cart animation using shared helper (guaranteed execution)
        ShopziCurious.animateFlyToCart(cardOrSection);

        // Publish CART_UPDATED event with openDrawer: false (STAY ON CURRENT PAGE)
        ShopziCurious.pubsub.publish(ShopziCurious.events.CART_UPDATED, {
          item: data,
          item_count: cartData.item_count,
          openDrawer: false
        });

        // Toast Notification
        if (ShopziCurious.showToast) {
          ShopziCurious.showToast('Added to cart');
        }
      } catch (err) {
        console.error('[ShopziCurious Form Add Error]', err);
        if (ShopziCurious.showToast) {
          ShopziCurious.showToast(err.message || 'Error adding item to cart', 'error');
        }
      } finally {
        if (submitBtn) {
          submitBtn.classList.remove('szc-btn--loading');
          submitBtn.removeAttribute('aria-disabled');
        }
      }
    });

    // Update Cart Badge & Refresh Cart Page on CART_UPDATED or cart:updated
    const updateCartBadgesAndPage = async (cartData) => {
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

        // Dynamic Cart Page Refresh (If on Cart Page)
        if (document.getElementById('MainCartPage')) {
          ShopziCurious.refreshCartPage();
        }
      } catch (err) {
        console.error('Failed to update cart badge and page:', err);
      }
    };

    ShopziCurious.pubsub.subscribe(ShopziCurious.events.CART_UPDATED, updateCartBadgesAndPage);
    ShopziCurious.pubsub.subscribe('cart:updated', updateCartBadgesAndPage);
  });
})();
