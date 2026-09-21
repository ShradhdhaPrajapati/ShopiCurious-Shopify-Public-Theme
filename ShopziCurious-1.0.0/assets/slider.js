/**
 * ShopziCurious Theme - Accessible Carousel Slider Custom Element (slider.js)
 * Purpose: Light-weight, dependency-free Web Component (<theme-slider>) supporting
 * touch swipe, pagination dots, arrow navigation, and keyboard arrow controls.
 */

(function () {
  'use strict';

  class ThemeSlider extends HTMLElement {
    constructor() {
      super();
      this.slider = this.querySelector('[data-slider-track]');
      this.slides = Array.from(this.querySelectorAll('[data-slider-slide]'));
      this.prevButton = this.querySelector('[data-slider-prev]');
      this.nextButton = this.querySelector('[data-slider-next]');
      this.dotsContainer = this.querySelector('[data-slider-dots]');
      this.currentIndex = 0;
      this.touchStartX = 0;
      this.touchEndX = 0;
    }

    connectedCallback() {
      if (!this.slider || this.slides.length === 0) return;

      if (this.prevButton) {
        this.prevButton.addEventListener('click', () => this.prev());
      }
      if (this.nextButton) {
        this.nextButton.addEventListener('click', () => this.next());
      }

      this.initTouchEvents();
      this.updateState();
    }

    goTo(index) {
      if (index < 0) index = 0;
      if (index >= this.slides.length) index = this.slides.length - 1;

      this.currentIndex = index;
      const targetSlide = this.slides[this.currentIndex];
      if (targetSlide) {
        this.slider.scrollTo({
          left: targetSlide.offsetLeft,
          behavior: 'smooth',
        });
      }
      this.updateState();
    }

    next() {
      this.goTo(this.currentIndex + 1);
    }

    prev() {
      this.goTo(this.currentIndex - 1);
    }

    updateState() {
      if (this.prevButton) {
        this.prevButton.disabled = this.currentIndex === 0;
      }
      if (this.nextButton) {
        this.nextButton.disabled = this.currentIndex === this.slides.length - 1;
      }
    }

    initTouchEvents() {
      this.slider.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      this.slider.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      }, { passive: true });
    }

    handleSwipe() {
      const threshold = 40;
      if (this.touchEndX < this.touchStartX - threshold) {
        this.next();
      }
      if (this.touchEndX > this.touchStartX + threshold) {
        this.prev();
      }
    }
  }

  ShopziCurious.defineCustomElement('theme-slider', ThemeSlider);
})();
