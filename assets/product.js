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

      this.submitButton.classList.add('szc-btn--loading');
      this.submitButton.setAttribute('aria-disabled', 'true');

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

        const cartType = (window.ShopziCurious && window.ShopziCurious.settings && window.ShopziCurious.settings.cartType) ? window.ShopziCurious.settings.cartType : 'drawer';

        if (cartType === 'page') {
          window.location.href = window.ShopziCurious.routes.cart_url || '/cart';
          return;
        }

        // Fetch updated cart details
        const cartRes = await fetch('/cart.js');
        const cartData = await cartRes.json();

        // Publish Global Cart Update Event
        ShopziCurious.pubsub.publish(ShopziCurious.events.CART_UPDATED, {
          item: responseData,
          item_count: cartData.item_count,
          openDrawer: true,
        });
      } catch (error) {
        console.error('[ShopziCurious Product Form Error]', error);
        alert(error.message || 'Error adding item to bag');
      } finally {
        this.submitButton.classList.remove('szc-btn--loading');
        this.submitButton.removeAttribute('aria-disabled');
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
    }

    onButtonClick(event) {
      event.preventDefault();
      const previousValue = this.input.value;

      if (event.currentTarget.name === 'plus') {
        this.input.stepUp();
      } else {
        this.input.stepDown();
      }

      if (previousValue !== this.input.value) {
        this.input.dispatchEvent(this.changeEvent);
      }
    }
  }

  ShopziCurious.defineCustomElement('product-form', ProductForm);
  ShopziCurious.defineCustomElement('quantity-input', QuantityInput);
})();
