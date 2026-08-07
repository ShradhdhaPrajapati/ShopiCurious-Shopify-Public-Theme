/**
 * ShopziCurious - Native Wishlist Engine
 * Handles client-side wishlist state, localStorage persistence, real-time DOM synchronization,
 * dynamic heart button toggles, header count badge updates, and pub/sub events.
 */

window.ShopziCurious = window.ShopziCurious || {};

(function () {
  const STORAGE_KEY = 'shopzicurious_wishlist';

  class WishlistEngine {
    constructor() {
      this.items = this.loadFromStorage();
      this.init();
    }

    init() {
      document.addEventListener('DOMContentLoaded', () => {
        this.updateBadges();
        this.updateButtons();
        this.bindEvents();
      });

      // Cross-tab synchronization via StorageEvent
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.items = this.loadFromStorage();
          this.updateBadges();
          this.updateButtons();
          this.notifySubscribers();
        }
      });
    }

    loadFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error('Failed to parse wishlist from localStorage:', e);
        return [];
      }
    }

    saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
      } catch (e) {
        console.error('Failed to save wishlist to localStorage:', e);
      }
    }

    get() {
      return [...this.items];
    }

    has(handleOrId) {
      if (!handleOrId) return false;
      const key = String(handleOrId);
      return this.items.some((item) => String(item.handle) === key || String(item.id) === key);
    }

    add(item) {
      if (!item || !item.handle) return false;
      if (this.has(item.handle)) return false;

      const newItem = {
        handle: String(item.handle),
        id: item.id ? String(item.id) : String(item.handle),
        title: item.title || 'Product',
        price: item.price || '',
        compare_at_price: item.compare_at_price || '',
        image: item.image || '',
        url: item.url || `/products/${item.handle}`,
        vendor: item.vendor || '',
        available: item.available !== undefined ? item.available : true,
        variantTitle: item.variantTitle || '',
        addedAt: Date.now()
      };

      this.items.unshift(newItem);
      this.saveToStorage();
      this.updateBadges(true);
      this.updateButtons();
      this.notifySubscribers();

      if (window.ShopziCurious && window.ShopziCurious.showToast) {
        window.ShopziCurious.showToast('Added to wishlist');
      }

      return true;
    }

    remove(handleOrId) {
      if (!handleOrId) return false;
      const key = String(handleOrId);
      const initialLength = this.items.length;
      this.items = this.items.filter((item) => String(item.handle) !== key && String(item.id) !== key);

      if (this.items.length !== initialLength) {
        this.saveToStorage();
        this.updateBadges(true);
        this.updateButtons();
        this.notifySubscribers();

        if (window.ShopziCurious && window.ShopziCurious.showToast) {
          window.ShopziCurious.showToast('Removed from wishlist');
        }
        return true;
      }
      return false;
    }

    toggle(item) {
      if (!item || !item.handle) return false;
      if (this.has(item.handle)) {
        this.remove(item.handle);
        return false;
      } else {
        this.add(item);
        return true;
      }
    }

    clear() {
      this.items = [];
      this.saveToStorage();
      this.updateBadges(true);
      this.updateButtons();
      this.notifySubscribers();
    }

    updateBadges(animate = false) {
      const count = this.items.length;
      const badges = document.querySelectorAll('[data-wishlist-count], .szc-header__wishlist-badge');
      badges.forEach((badge) => {
        if (badge.classList.contains('szc-wishlist-title__count')) {
          badge.textContent = `(${count})`;
        } else {
          badge.textContent = count;
          if (badge.classList.contains('szc-header__wishlist-badge')) {
            badge.style.display = count > 0 ? 'flex' : 'none';
          }
        }
        badge.setAttribute('data-wishlist-count', count);
        if (animate) {
          badge.classList.add('is-pop');
          setTimeout(() => badge.classList.remove('is-pop'), 300);
        }
      });

      // Cleanup any duplicate wishlist links or extra SVG icons in header
      const headerWishlistLinks = document.querySelectorAll('.szc-header__icons .szc-wishlist-header-link');
      if (headerWishlistLinks.length > 1) {
        for (let i = 1; i < headerWishlistLinks.length; i++) {
          headerWishlistLinks[i].remove();
        }
      }

      const mainWishlistLink = document.querySelector('.szc-wishlist-header-link');
      if (mainWishlistLink) {
        const svgIcons = mainWishlistLink.querySelectorAll('svg');
        if (svgIcons.length > 1) {
          for (let i = 1; i < svgIcons.length; i++) {
            svgIcons[i].remove();
          }
        }
      }
    }

    updateButtons() {
      const buttons = document.querySelectorAll('[data-wishlist-toggle]');
      buttons.forEach((btn) => {
        const handle = btn.getAttribute('data-product-handle') || btn.getAttribute('data-product-id');
        if (!handle) return;

        const isWishlisted = this.has(handle);
        if (isWishlisted) {
          btn.classList.add('is-active');
          btn.setAttribute('aria-label', 'Remove from wishlist');
          btn.setAttribute('title', 'Remove from wishlist');
          const iconContainer = btn.querySelector('.szc-wishlist-icon-wrap') || btn;
          if (iconContainer) {
            iconContainer.innerHTML = `<svg class="szc-icon szc-icon--heart-solid szc-product-card__wishlist-icon" viewBox="0 0 24 24" fill="#e63946" stroke="#e63946" stroke-width="1" aria-hidden="true" style="width:16px;height:16px;display:block;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
          }
        } else {
          btn.classList.remove('is-active');
          btn.setAttribute('aria-label', 'Add to wishlist');
          btn.setAttribute('title', 'Add to wishlist');
          const iconContainer = btn.querySelector('.szc-wishlist-icon-wrap') || btn;
          if (iconContainer) {
            iconContainer.innerHTML = `<svg class="szc-icon szc-icon--heart szc-product-card__wishlist-icon" viewBox="0 0 24 24" fill="none" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:16px;height:16px;display:block;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
          }
        }
      });
    }

    notifySubscribers() {
      if (window.ShopziCurious && window.ShopziCurious.pubsub && window.ShopziCurious.pubsub.publish) {
        window.ShopziCurious.pubsub.publish('WISHLIST_UPDATED', {
          count: this.items.length,
          items: this.get()
        });
      }
      // Fire custom window event
      window.dispatchEvent(new CustomEvent('shopzicurious:wishlist:updated', {
        detail: { count: this.items.length, items: this.get() }
      }));
    }

    bindEvents() {
      // Global event delegation for Wishlist Toggle Buttons
      document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('[data-wishlist-toggle]');
        if (toggleBtn) {
          e.preventDefault();
          e.stopPropagation();

          const productData = {
            handle: toggleBtn.getAttribute('data-product-handle'),
            id: toggleBtn.getAttribute('data-product-id'),
            title: toggleBtn.getAttribute('data-product-title'),
            price: toggleBtn.getAttribute('data-product-price'),
            compare_at_price: toggleBtn.getAttribute('data-product-compare-price'),
            image: toggleBtn.getAttribute('data-product-image'),
            url: toggleBtn.getAttribute('data-product-url'),
            vendor: toggleBtn.getAttribute('data-product-vendor'),
            available: toggleBtn.getAttribute('data-product-available') !== 'false',
            variantTitle: toggleBtn.getAttribute('data-product-variant-title') || ''
          };

          if (productData.handle) {
            // Heart pop effect
            toggleBtn.classList.add('is-pop');
            setTimeout(() => toggleBtn.classList.remove('is-pop'), 400);

            this.toggle(productData);
          }
        }
      });
    }
  }

  window.ShopziCurious.wishlist = new WishlistEngine();
})();
