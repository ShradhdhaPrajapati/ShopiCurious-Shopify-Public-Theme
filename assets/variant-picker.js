/**
 * ShopziCurious Theme - Variant Selection Handler (variant-picker.js)
 * Purpose: Custom Elements (<variant-selects>, <variant-radios>) for option selection,
 * variant availability validation, URL param syncing, image swapping, and price updates.
 */

(function () {
  'use strict';

  class VariantSelects extends HTMLElement {
    constructor() {
      super();
      this.addEventListener('change', this.onVariantChange.bind(this));
    }

    onVariantChange() {
      this.updateOptions();
      this.updateMasterId();

      if (!this.currentVariant) {
        this.setUnavailable();
      } else {
        this.updateMedia();
        this.updateURL();
        this.updateVariantInput();
        this.renderProductInfo();

        if (window.ShopziCurious && ShopziCurious.pubsub) {
          ShopziCurious.pubsub.publish(ShopziCurious.events.VARIANT_CHANGE, {
            variant: this.currentVariant,
            container: this,
          });
        }
      }
    }

    updateOptions() {
      const fieldsets = Array.from(this.querySelectorAll('fieldset'));
      if (fieldsets.length > 0) {
        this.options = fieldsets.map((fieldset) => {
          return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked)?.value;
        });
      } else {
        this.options = Array.from(this.querySelectorAll('select, fieldset input:checked'), (element) => element.value);
      }
    }

    updateMasterId() {
      this.currentVariant = this.getVariantData().find((variant) => {
        return !variant.options.map((option, index) => this.options[index] === option).includes(false);
      });
    }

    getVariantData() {
      this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
      return this.variantData;
    }

    updateURL() {
      if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
      window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
    }

    updateVariantInput() {
      const productForms = document.querySelectorAll(`form[action*="/cart/add"], #product-form-${this.dataset.section}, #product-form-main`);
      productForms.forEach((productForm) => {
        const input = productForm.querySelector('input[name="id"]');
        if (input) {
          input.value = this.currentVariant.id;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }

    renderProductInfo() {
      // Update Price display
      const priceContainers = document.querySelectorAll(`.szc-main-product__price, #price-${this.dataset.section}`);
      priceContainers.forEach(priceContainer => {
        if (priceContainer && this.currentVariant) {
          const priceElement = priceContainer.querySelector('.price-item--regular, .szc-price__regular') || priceContainer;
          if (priceElement) {
            const formattedPrice = (window.ShopziCurious && ShopziCurious.helpers) 
              ? ShopziCurious.helpers.formatMoney(this.currentVariant.price) 
              : `$${(this.currentVariant.price / 100).toFixed(2)}`;
            priceElement.textContent = formattedPrice;
          }
        }
      });

      // Update Submit Button State
      const submitButtons = document.querySelectorAll(`[data-add-to-cart-btn], #product-submit-${this.dataset.section}`);
      submitButtons.forEach(submitButton => {
        if (submitButton) {
          const textSpan = submitButton.querySelector('span') || submitButton;
          if (!this.currentVariant.available) {
            submitButton.setAttribute('disabled', 'disabled');
            textSpan.textContent = 'SOLD OUT';
          } else {
            submitButton.removeAttribute('disabled');
            textSpan.textContent = 'ADD TO BAG';
          }
        }
      });
    }

    updateMedia() {
      if (!this.currentVariant || !this.currentVariant.featured_media) return;
      const mediaId = this.currentVariant.featured_media.id;
      const targetThumbnail = document.querySelector(`[data-media-id="${mediaId}"]`);
      if (targetThumbnail) {
        targetThumbnail.click();
      }
    }

    setUnavailable() {
      const submitButtons = document.querySelectorAll(`[data-add-to-cart-btn], #product-submit-${this.dataset.section}`);
      submitButtons.forEach(submitButton => {
        if (submitButton) {
          const textSpan = submitButton.querySelector('span') || submitButton;
          submitButton.setAttribute('disabled', 'disabled');
          textSpan.textContent = 'UNAVAILABLE';
        }
      });
    }
  }

  ShopziCurious.defineCustomElement('variant-selects', VariantSelects);
  ShopziCurious.defineCustomElement('variant-radios', VariantSelects);
})();
