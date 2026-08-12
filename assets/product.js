/**
 * ShopziCurious Theme - Product Form & Quantity Web Component (product.js)
 * Purpose: Product page custom element (<product-form>) for AJAX add-to-cart,
 * stock validation, quantity selector adjustments, and quick shop handling.
 */

(function () {
  'use strict';

  class ProductForm extends HTMLElement {
    constructor() {
      super();
      this.form = this.querySelector('form');
      if (!this.form) return;
      this.submitButton = this.querySelector('[type="submit"]');
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    }

    async onSubmitHandler(evt) {
      evt.preventDefault();
      if (!this.submitButton || this.submitButton.classList.contains('szc-btn--loading')) return;

      const stickyBtn = document.querySelector('[data-sticky-atc-btn]');
      const activeSticky = document.activeElement && document.activeElement.closest('[data-sticky-atc-bar]');

      this.submitButton.classList.add('szc-btn--loading', 'is-loading');
      this.submitButton.setAttribute('aria-disabled', 'true');

      if (stickyBtn) {
        stickyBtn.classList.add('szc-btn--loading', 'is-loading');
        stickyBtn.setAttribute('aria-disabled', 'true');
        stickyBtn.disabled = true;
      }

      const formData = new FormData(this.form);
      const config = {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
        body: formData,
      };

      try {
        const response = await fetch('/cart/add.js', config);
        const responseData = await response.json();

        if (response.status === 422 || responseData.status) {
          throw new Error(responseData.description || 'Could not add item to bag');
        }

        // Fetch updated cart details
        const cartRes = await fetch('/cart.js');
        const cartData = await cartRes.json();

        const flySource = activeSticky || document.querySelector('[data-sticky-atc-bar].is-visible') || this;
        if (window.ShopziCurious && window.ShopziCurious.animateFlyToCart) {
          window.ShopziCurious.animateFlyToCart(flySource);
        } else if (window.ShopziCurious && window.ShopziCurious.bounceCartBadge) {
          window.ShopziCurious.bounceCartBadge();
        }

        // Publish Global Cart Update Event (DO NOT open drawer or redirect)
        ShopziCurious.pubsub.publish(ShopziCurious.events.CART_UPDATED, {
          item: responseData,
          item_count: cartData.item_count,
          openDrawer: false,
        });

        // Show Toast Notification
        if (window.ShopziCurious && window.ShopziCurious.showToast) {
          window.ShopziCurious.showToast('Added to cart');
        }
      } catch (error) {
        console.error('[ShopziCurious Product Form Error]', error);
        if (window.ShopziCurious && window.ShopziCurious.showToast) {
          window.ShopziCurious.showToast(error.message || 'Error adding item to cart', 'error');
        }
      } finally {
        if (this.submitButton) {
          this.submitButton.classList.remove('szc-btn--loading', 'is-loading');
          this.submitButton.removeAttribute('aria-disabled');
        }
        if (stickyBtn) {
          stickyBtn.classList.remove('szc-btn--loading', 'is-loading');
          stickyBtn.removeAttribute('aria-disabled');
          const textSpan = stickyBtn.querySelector('.szc-btn-text') || stickyBtn.querySelector('span');
          if (textSpan && textSpan.textContent.trim() !== 'SOLD OUT') {
            stickyBtn.disabled = false;
            textSpan.textContent = 'ADD TO BAG';
          }
        }
      }
    }
  }

  class QuantityInput extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector('input');
      this.changeEvent = new Event('change', { bubbles: true });

      this.querySelectorAll('button').forEach((button) =>
        button.addEventListener('click', this.onButtonClick.bind(this))
      );

      if (this.input) {
        this.input.addEventListener('change', this.validateQty.bind(this));
      }
      this.validateQty();
    }

    validateQty() {
      if (!this.input) return;
      const value = parseInt(this.input.value, 10) || 1;
      const min = parseInt(this.input.getAttribute('min'), 10) || 1;
      const max = this.input.getAttribute('max') ? parseInt(this.input.getAttribute('max'), 10) : null;
      const minusBtn = this.querySelector('button[name="decrement"]') || this.querySelector('button[name="minus"]') || this.querySelector('.szc-quantity-input__button--minus');
      const plusBtn = this.querySelector('button[name="increment"]') || this.querySelector('button[name="plus"]') || this.querySelector('.szc-quantity-input__button--plus');

      if (minusBtn) {
        minusBtn.disabled = value <= min;
      }
      if (plusBtn) {
        plusBtn.disabled = max !== null && value >= max;
      }
    }

    onButtonClick(event) {
      event.preventDefault();
      const previousValue = this.input.value;

      const isIncrement = event.currentTarget.name === 'increment' || event.currentTarget.name === 'plus' || event.currentTarget.classList.contains('szc-quantity-input__button--plus');

      if (isIncrement) {
        this.input.stepUp();
      } else {
        this.input.stepDown();
      }

      this.validateQty();

      if (previousValue !== this.input.value) {
        this.input.dispatchEvent(this.changeEvent);
      }
    }
  }

  ShopziCurious.defineCustomElement('product-form', ProductForm);
  ShopziCurious.defineCustomElement('quantity-input', QuantityInput);
})();
