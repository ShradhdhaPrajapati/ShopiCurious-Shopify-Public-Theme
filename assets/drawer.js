/**
 * ShopziCurious Theme - Reusable Slide-Out Drawer Web Component (drawer.js)
 * Purpose: Generic slide-out drawer web component (<theme-drawer>) for mobile navigation,
 * quick shop drawer, search drawer, and Ajax cart drawer.
 */

(function () {
  'use strict';

  class ThemeDrawer extends HTMLElement {
    constructor() {
      super();
      this.overlay = this.querySelector('.kz-drawer__overlay');
      this.closeButton = this.querySelector('[data-drawer-close]');
      this.onKeyUpHandler = this.onKeyUp.bind(this);
    }

    connectedCallback() {
      if (this.closeButton) {
        this.closeButton.addEventListener('click', this.close.bind(this));
      }
      if (this.overlay) {
        this.overlay.addEventListener('click', this.close.bind(this));
      }
    }

    open(opener = null) {
      this.openedBy = opener;
      this.setAttribute('open', '');
      document.body.classList.add('kz-overflow-hidden');

      if (window.ShopziCurious && ShopziCurious.trapFocus) {
        ShopziCurious.trapFocus(this, this.querySelector('.kz-drawer__inner'));
      }

      document.addEventListener('keyup', this.onKeyUpHandler);
      ShopziCurious.pubsub.publish(ShopziCurious.events.DRAWER_TOGGLE, { drawer: this, state: 'open' });
    }

    close() {
      this.removeAttribute('open');
      document.body.classList.remove('kz-overflow-hidden');

      if (window.ShopziCurious && ShopziCurious.removeTrapFocus) {
        ShopziCurious.removeTrapFocus(this, this.openedBy);
      }

      document.removeEventListener('keyup', this.onKeyUpHandler);
      ShopziCurious.pubsub.publish(ShopziCurious.events.DRAWER_TOGGLE, { drawer: this, state: 'closed' });
    }

    onKeyUp(event) {
      if (event.code === 'Escape') {
        this.close();
      }
    }
  }

  ShopziCurious.defineCustomElement('theme-drawer', ThemeDrawer);
})();
