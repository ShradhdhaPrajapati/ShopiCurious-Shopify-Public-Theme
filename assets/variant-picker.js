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
    }

    connectedCallback() {
      this.addEventListener('change', this.onVariantChange.bind(this));
      this.addEventListener('input', this.onVariantChange.bind(this));

      this.updateOptions();
      this.updateMasterId();
      this.updateOptionLabels();
      this.updateSwatchAvailability();
    }

    decodeOption(str) {
      if (str == null) return '';
      const txt = document.createElement('textarea');
      txt.innerHTML = String(str);
      return txt.value.trim();
    }

    onVariantChange() {
      this.updateOptions();
      this.updateMasterId();
      this.updateOptionLabels();
      this.updateSwatchAvailability();

      if (!this.currentVariant) {
        this.setUnavailable();
      } else {
        this.updateMedia();
        this.updateURL();
        this.updateVariantInput();
        this.renderProductInfo();

        if (window.ShopziCurious && ShopziCurious.pubsub && ShopziCurious.events) {
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
          const select = fieldset.querySelector('select');
          if (select) return this.decodeOption(select.value);
          const checkedRadio = fieldset.querySelector('input[type="radio"]:checked');
          return checkedRadio ? this.decodeOption(checkedRadio.value) : null;
        });
      } else {
        this.options = Array.from(
          this.querySelectorAll('select, input[type="radio"]:checked'),
          (el) => this.decodeOption(el.value)
        );
      }
    }

    updateMasterId() {
      const variants = this.getVariantData();
      if (!variants || !Array.isArray(variants)) {
        this.currentVariant = null;
        return;
      }

      this.currentVariant = variants.find((variant) => {
        if (!variant.options || variant.options.length !== this.options.length) {
          return false;
        }
        return variant.options.every((option, index) => {
          const selected = this.options[index];
          if (selected === null || selected === undefined) return false;
          return selected.toLowerCase() === this.decodeOption(option).toLowerCase();
        });
      });
    }

    updateOptionLabels() {
      const fieldsets = Array.from(this.querySelectorAll('fieldset'));
      fieldsets.forEach((fieldset, index) => {
        const selectedVal = this.options[index];
        if (selectedVal) {
          const selectedSpan = fieldset.querySelector('[data-option-selected]');
          if (selectedSpan) {
            selectedSpan.textContent = selectedVal;
          }
        }
      });
    }

    updateSwatchAvailability() {
      const variants = this.getVariantData();
      if (!variants || !Array.isArray(variants)) return;

      const fieldsets = Array.from(this.querySelectorAll('fieldset'));
      if (fieldsets.length <= 1) return;

      fieldsets.forEach((fieldset, optionIndex) => {
        const inputs = Array.from(fieldset.querySelectorAll('input[type="radio"]'));
        inputs.forEach((input) => {
          const val = this.decodeOption(input.value);
          const isCombinationAvailable = variants.some((variant) => {
            if (!variant.available) return false;
            return variant.options.every((opt, idx) => {
              if (idx === optionIndex) {
                return this.decodeOption(opt).toLowerCase() === val.toLowerCase();
              }
              const currentOtherVal = this.options[idx];
              if (!currentOtherVal) return true;
              return this.decodeOption(opt).toLowerCase() === currentOtherVal.toLowerCase();
            });
          });

          const swatchWrapper = input.closest('.szc-swatch');
          if (swatchWrapper) {
            if (isCombinationAvailable) {
              swatchWrapper.classList.remove('is-disabled');
            } else {
              swatchWrapper.classList.add('is-disabled');
            }
          }
        });
      });
    }

    getVariantData() {
      if (!this.variantData) {
        const jsonEl = this.querySelector('[type="application/json"]');
        if (jsonEl && jsonEl.textContent) {
          try {
            this.variantData = JSON.parse(jsonEl.textContent);
          } catch (e) {
            console.error('[ShopziCurious] Error parsing variant JSON:', e);
            this.variantData = [];
          }
        } else {
          this.variantData = [];
        }
      }
      return this.variantData;
    }

    updateURL() {
      if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
      const url = this.dataset.url || window.location.pathname;
      window.history.replaceState({}, '', `${url}?variant=${this.currentVariant.id}`);
    }

    updateVariantInput() {
      if (!this.currentVariant) return;

      const inputs = document.querySelectorAll(
        `form[action*="/cart/add"] input[name="id"], #product-form-${this.dataset.section} input[name="id"], #product-form-main input[name="id"], [data-variant-input]`
      );
      inputs.forEach((input) => {
        input.value = this.currentVariant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      const buttons = document.querySelectorAll(
        `[data-add-to-cart-btn], [data-sticky-atc-btn], [data-buy-now-btn], [data-sticky-buy-now-btn]`
      );
      buttons.forEach((btn) => {
        btn.dataset.variantId = this.currentVariant.id;
      });
    }

    renderProductInfo() {
      if (!this.currentVariant) return;

      const fallbackSym = (window.ShopziCurious && window.ShopziCurious.currencySymbol) || '$';
      const moneyFormat =
        (window.ShopziCurious && window.ShopziCurious.moneyFormat) || `${fallbackSym}{{amount}}`;
      const formattedPrice =
        window.ShopziCurious && ShopziCurious.helpers && ShopziCurious.helpers.formatMoney
          ? ShopziCurious.helpers.formatMoney(this.currentVariant.price, moneyFormat)
          : `${fallbackSym}${(this.currentVariant.price / 100).toFixed(2)}`;

      const priceContainers = document.querySelectorAll(
        `.szc-main-product__price, #price-${this.dataset.section}, [data-sticky-price], .szc-sticky-atc-bar__price`
      );

      priceContainers.forEach((priceContainer) => {
        const regularElements = priceContainer.querySelectorAll(
          '.szc-price__item--regular, .price-item--regular'
        );
        const saleElements = priceContainer.querySelectorAll(
          '.szc-price__item--sale, .price-item--sale'
        );
        const badgeElements = priceContainer.querySelectorAll(
          '.szc-price__badge, [data-discount-badge], .szc-product-discount-badge'
        );
        const priceWraps = priceContainer.querySelectorAll('.szc-price');

        if (this.currentVariant.compare_at_price > this.currentVariant.price) {
          const formattedCompare =
            window.ShopziCurious && ShopziCurious.helpers && ShopziCurious.helpers.formatMoney
              ? ShopziCurious.helpers.formatMoney(this.currentVariant.compare_at_price, moneyFormat)
              : `${fallbackSym}${(this.currentVariant.compare_at_price / 100).toFixed(2)}`;
          const savings = Math.round(
            ((this.currentVariant.compare_at_price - this.currentVariant.price) * 100) /
              this.currentVariant.compare_at_price
          );

          priceWraps.forEach((w) => {
            w.classList.add('szc-price--on-sale');
            w.classList.remove('szc-price--sold-out');
          });

          saleElements.forEach((s) => {
            s.textContent = formattedPrice;
            if (s.parentElement) s.parentElement.style.display = 'inline-flex';
          });

          regularElements.forEach((r) => {
            if (r.tagName === 'S') {
              r.textContent = formattedCompare;
              r.style.display = 'inline-block';
              if (r.parentElement) r.parentElement.style.display = 'inline-flex';
            } else {
              r.style.display = 'none';
            }
          });

          badgeElements.forEach((b) => {
            if (
              b.classList.contains('szc-product-discount-badge') ||
              b.hasAttribute('data-discount-badge')
            ) {
              b.textContent = `${savings}% OFF`;
              b.style.display = 'inline-flex';
            } else {
              b.textContent = `-${savings}%`;
              b.style.display = 'inline-block';
            }
          });
        } else {
          priceWraps.forEach((w) => {
            w.classList.remove('szc-price--on-sale');
            w.classList.remove('szc-price--sold-out');
          });

          regularElements.forEach((r) => {
            if (r.tagName === 'S') {
              r.textContent = '';
              r.style.display = 'none';
              if (r.parentElement) r.parentElement.style.display = 'none';
            } else {
              r.textContent = formattedPrice;
              r.style.display = 'inline-block';
              if (r.parentElement) r.parentElement.style.display = 'inline-flex';
            }
          });

          saleElements.forEach((s) => {
            s.textContent = formattedPrice;
            if (s.parentElement) s.parentElement.style.display = 'none';
          });

          badgeElements.forEach((b) => (b.style.display = 'none'));
        }
      });

      // Update Submit Button State across all buttons
      const submitButtons = document.querySelectorAll(
        `[data-add-to-cart-btn], [data-sticky-atc-btn], #product-submit-${this.dataset.section}`
      );
      const atcText =
        (window.ShopziCurious &&
          window.ShopziCurious.strings &&
          window.ShopziCurious.strings.addToCart) ||
        'ADD TO BAG';
      const soldOutText =
        (window.ShopziCurious &&
          window.ShopziCurious.strings &&
          window.ShopziCurious.strings.soldOut) ||
        'SOLD OUT';

      submitButtons.forEach((submitButton) => {
        if (submitButton) {
          const textSpan = submitButton.querySelector('.szc-btn-text, span') || submitButton;
          if (!this.currentVariant.available) {
            submitButton.setAttribute('disabled', 'disabled');
            textSpan.textContent = soldOutText;
          } else {
            submitButton.removeAttribute('disabled');
            textSpan.textContent = atcText;
          }
        }
      });

      // Update Buy Now Buttons State
      const buyNowButtons = document.querySelectorAll(
        `[data-buy-now-btn], [data-sticky-buy-now-btn], .szc-main-product__buy-now-btn`
      );
      buyNowButtons.forEach((btn) => {
        if (btn) {
          if (!this.currentVariant.available) {
            btn.setAttribute('disabled', 'disabled');
          } else {
            btn.removeAttribute('disabled');
          }
        }
      });
    }

    updateMedia() {
      if (!this.currentVariant) return;
      const mediaObj = this.currentVariant.featured_media || this.currentVariant.featured_image;
      if (!mediaObj) return;

      const mediaId = mediaObj.id ? String(mediaObj.id) : null;
      if (mediaId) {
        const targetThumbnail = document.querySelector(
          `.szc-main-product__thumbnail-btn[data-media-id="${mediaId}"]`
        );
        if (targetThumbnail) {
          targetThumbnail.click();
        } else {
          const targetSlide = document.querySelector(
            `.szc-main-product__slider-slide[data-media-id="${mediaId}"]`
          );
          if (targetSlide) {
            const index = parseInt(targetSlide.dataset.index, 10);
            const sliderList = document.querySelector('[data-slider-list]');
            if (sliderList && !isNaN(index)) {
              const targetLeft =
                targetSlide.offsetLeft > 0 ? targetSlide.offsetLeft : index * sliderList.clientWidth;
              sliderList.scrollTo({ left: targetLeft, behavior: 'smooth' });
            }
            document
              .querySelectorAll('.szc-main-product__slider-slide')
              .forEach((s) => s.classList.remove('is-active'));
            targetSlide.classList.add('is-active');
          }
        }

        const stackedMedia = document.querySelector(
          `.szc-main-product__stacked-item[data-media-id="${mediaId}"]`
        );
        if (stackedMedia) {
          stackedMedia.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      const stickyImg = document.querySelector('[data-sticky-img]');
      if (stickyImg) {
        const newSrc =
          (mediaObj.preview_image && mediaObj.preview_image.src) || mediaObj.src;
        if (newSrc) stickyImg.src = newSrc;
      }
    }

    setUnavailable() {
      const submitButtons = document.querySelectorAll(
        `[data-add-to-cart-btn], [data-sticky-atc-btn], #product-submit-${this.dataset.section}`
      );
      const unavailableText =
        (window.ShopziCurious &&
          window.ShopziCurious.strings &&
          window.ShopziCurious.strings.unavailable) ||
        'UNAVAILABLE';

      submitButtons.forEach((submitButton) => {
        if (submitButton) {
          const textSpan = submitButton.querySelector('.szc-btn-text, span') || submitButton;
          submitButton.setAttribute('disabled', 'disabled');
          textSpan.textContent = unavailableText;
        }
      });

      const buyNowButtons = document.querySelectorAll(
        `[data-buy-now-btn], [data-sticky-buy-now-btn], .szc-main-product__buy-now-btn`
      );
      buyNowButtons.forEach((btn) => {
        if (btn) btn.setAttribute('disabled', 'disabled');
      });

      const inputs = document.querySelectorAll(
        `form[action*="/cart/add"] input[name="id"], #product-form-${this.dataset.section} input[name="id"], #product-form-main input[name="id"], [data-variant-input]`
      );
      inputs.forEach((input) => {
        input.value = '';
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      const priceWraps = document.querySelectorAll('.szc-price');
      priceWraps.forEach((w) => w.classList.add('szc-price--sold-out'));

      this.updateOptionLabels();

      if (window.ShopziCurious && ShopziCurious.pubsub && ShopziCurious.events) {
        ShopziCurious.pubsub.publish(ShopziCurious.events.VARIANT_CHANGE, {
          variant: null,
          container: this,
        });
      }
    }
  }

  class VariantRadios extends VariantSelects {}

  ShopziCurious.defineCustomElement('variant-selects', VariantSelects);
  ShopziCurious.defineCustomElement('variant-radios', VariantRadios);
})();


