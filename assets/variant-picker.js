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
        this.updatePickupAvailability();
        this.setUnavailable();
      } else {
        this.updateMedia();
        this.updateURL();
        this.updateVariantInput();
        this.renderProductInfo();

        ShopziCurious.pubsub.publish(ShopziCurious.events.VARIANT_CHANGE, {
          variant: this.currentVariant,
          container: this,
        });
      }
    }

    updateOptions() {
      this.options = Array.from(this.querySelectorAll('select, fieldset input:checked'), (element) => element.value);
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
      const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
      productForms.forEach((productForm) => {
        const input = productForm.querySelector('input[name="id"]');
        input.value = this.currentVariant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    renderProductInfo() {
      // Update Price display
      const priceContainer = document.getElementById(`price-${this.dataset.section}`);
      if (priceContainer && this.currentVariant) {
        const priceElement = priceContainer.querySelector('.kz-price__regular');
        if (priceElement) {
          priceElement.textContent = ShopziCurious.helpers.formatMoney(this.currentVariant.price);
        }
      }

      // Update Submit Button State
      const submitButton = document.getElementById(`product-submit-${this.dataset.section}`);
      if (submitButton) {
        if (!this.currentVariant.available) {
          submitButton.setAttribute('disabled', 'disabled');
          submitButton.querySelector('span').textContent = 'Sold Out';
        } else {
          submitButton.removeAttribute('disabled');
          submitButton.querySelector('span').textContent = 'Add to Bag';
        }
      }
    }

    updateMedia() {
      if (!this.currentVariant || !this.currentVariant.featured_media) return;
      const mediaGallery = document.getElementById(`MediaGallery-${this.dataset.section}`);
      if (mediaGallery) {
        const activeMedia = mediaGallery.querySelector(`[data-media-id="${this.currentVariant.featured_media.id}"]`);
        if (activeMedia && activeMedia.parentNode) {
          activeMedia.parentNode.prepend(activeMedia);
        }
      }
    }

    setUnavailable() {
      const submitButton = document.getElementById(`product-submit-${this.dataset.section}`);
      if (submitButton) {
        submitButton.setAttribute('disabled', 'disabled');
        submitButton.querySelector('span').textContent = 'Unavailable';
      }
    }
  }

  class VariantRadios extends VariantSelects {
    constructor() {
      super();
    }

    updateOptions() {
      const fieldsets = Array.from(this.querySelectorAll('fieldset'));
      this.options = fieldsets.map((fieldset) => {
        return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked)?.value;
      });
    }
  }

  ShopziCurious.defineCustomElement('variant-selects', VariantSelects);
  ShopziCurious.defineCustomElement('variant-radios', VariantRadios);
})();
