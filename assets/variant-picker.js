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
      const priceContainers = document.querySelectorAll(`.szc-main-product__price, #price-${this.dataset.section}, [data-sticky-price]`);
      priceContainers.forEach(priceContainer => {
        if (priceContainer && this.currentVariant) {
          const formattedPrice = (window.ShopziCurious && ShopziCurious.helpers) 
            ? ShopziCurious.helpers.formatMoney(this.currentVariant.price) 
            : `$${(this.currentVariant.price / 100).toFixed(2)}`;

          const regularElements = priceContainer.querySelectorAll('.szc-price__item--regular, .price-item--regular');
          const saleElements = priceContainer.querySelectorAll('.szc-price__item--sale');
          const badgeElements = priceContainer.querySelectorAll('.szc-price__badge, [data-discount-badge], .szc-product-discount-badge');
          const priceWraps = priceContainer.querySelectorAll('.szc-price');

          if (this.currentVariant.compare_at_price > this.currentVariant.price) {
            const formattedCompare = (window.ShopziCurious && ShopziCurious.helpers) 
              ? ShopziCurious.helpers.formatMoney(this.currentVariant.compare_at_price) 
              : `$${(this.currentVariant.compare_at_price / 100).toFixed(2)}`;
            const savings = Math.round(((this.currentVariant.compare_at_price - this.currentVariant.price) * 100) / this.currentVariant.compare_at_price);

            priceWraps.forEach(w => w.classList.add('szc-price--on-sale'));
            saleElements.forEach(s => {
              s.textContent = formattedPrice;
              if (s.parentElement) s.parentElement.style.display = 'inline-flex';
            });
            regularElements.forEach(r => {
              r.textContent = formattedCompare;
              r.style.display = 'inline-block';
            });
            badgeElements.forEach(b => {
              if (b.classList.contains('szc-product-discount-badge') || b.hasAttribute('data-discount-badge')) {
                b.textContent = `${savings}% OFF`;
                b.style.display = 'inline-flex';
              } else {
                b.textContent = `-${savings}%`;
                b.style.display = 'inline-block';
              }
            });
          } else {
            priceWraps.forEach(w => w.classList.remove('szc-price--on-sale'));
            saleElements.forEach(s => {
              s.textContent = formattedPrice;
              if (s.parentElement) s.parentElement.style.display = 'none';
            });
            regularElements.forEach(r => {
              r.textContent = '';
              r.style.display = 'none';
            });
            badgeElements.forEach(b => b.style.display = 'none');
          }
        }
      });

      // Update Submit Button State across all buttons
      const submitButtons = document.querySelectorAll(`[data-add-to-cart-btn], [data-sticky-atc-btn], #product-submit-${this.dataset.section}`);
      submitButtons.forEach(submitButton => {
        if (submitButton) {
          const textSpan = submitButton.querySelector('.szc-btn-text, span') || submitButton;
          if (!this.currentVariant || !this.currentVariant.available) {
            submitButton.setAttribute('disabled', 'disabled');
            textSpan.textContent = 'SOLD OUT';
          } else {
            submitButton.removeAttribute('disabled');
            textSpan.textContent = 'ADD TO BAG';
          }
        }
      });

      // Update Buy Now Buttons State
      const buyNowButtons = document.querySelectorAll(`[data-buy-now-btn], [data-sticky-buy-now-btn], .szc-main-product__buy-now-btn`);
      buyNowButtons.forEach(btn => {
        if (btn) {
          if (!this.currentVariant || !this.currentVariant.available) {
            btn.setAttribute('disabled', 'disabled');
          } else {
            btn.removeAttribute('disabled');
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

      const stickyImg = document.querySelector('[data-sticky-img]');
      if (stickyImg && this.currentVariant.featured_media.preview_image) {
        const newSrc = this.currentVariant.featured_media.preview_image.src || this.currentVariant.featured_media.src;
        if (newSrc) stickyImg.src = newSrc;
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
