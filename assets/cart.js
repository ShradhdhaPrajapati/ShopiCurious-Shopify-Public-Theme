/**
 * ShopziCurious Theme - Ajax Cart & Drawer Web Component (cart.js)
 * Purpose: Web Components (<cart-drawer>, <cart-items>) for real-time section updates,
 * quantity changes, item deletion, free shipping progress bar, and badge count syncing.
 */

(function () {
  'use strict';

  class CartDrawer extends HTMLElement {
    constructor() {
      super();
      this.drawer = this.querySelector('theme-drawer');
      this.cartItemsContainer = this.querySelector('[data-cart-items-container]');
    }

    connectedCallback() {
      // Subscribe to global cart update event
      ShopziCurious.pubsub.subscribe(ShopziCurious.events.CART_UPDATED, (data) => {
        this.refreshCart(data.openDrawer);
      });
    }

    async refreshCart(openDrawer = false) {
      try {
        const response = await fetch('/cart.js');
        const cart = await response.json();
        
        // Update header cart count badges
        document.querySelectorAll('[data-cart-count]').forEach((badge) => {
          badge.textContent = cart.item_count;
          badge.classList.toggle('szc-d-none', cart.item_count === 0);
        });

        // Re-render cart drawer contents via Section Rendering API
        const sectionId = this.dataset.sectionId || 'cart-drawer';
        const html = await ShopziCurious.helpers.fetchSectionHTML(sectionId);
        if (html && this.cartItemsContainer) {
          const newContainer = html.querySelector('[data-cart-items-container]');
          if (newContainer) {
            this.cartItemsContainer.innerHTML = newContainer.innerHTML;
          }
        }

        if (openDrawer && this.drawer) {
          this.drawer.open();
        }
      } catch (error) {
        console.error('[ShopziCurious Cart Drawer Refresh Error]', error);
      }
    }
  }

  class CartItems extends HTMLElement {
    constructor() {
      super();
      this.addEventListener('change', this.onChange.bind(this));
    }

    onChange(event) {
      if (event.target.name === 'updates[]') {
        this.updateQuantity(event.target.dataset.index, event.target.value);
      }
    }

    async updateQuantity(line, quantity) {
      try {
        const response = await fetch('/cart/change.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ line: parseInt(line, 10), quantity: parseInt(quantity, 10) }),
        });
        const cart = await response.json();

        ShopziCurious.pubsub.publish(ShopziCurious.events.CART_UPDATED, {
          cart: cart,
          openDrawer: false,
        });
      } catch (error) {
        console.error('[ShopziCurious Cart Item Update Error]', error);
      }
    }
  }

  ShopziCurious.defineCustomElement('cart-drawer', CartDrawer);
  ShopziCurious.defineCustomElement('cart-items', CartItems);
})();
