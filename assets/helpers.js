/**
 * ShopziCurious Theme - Utility Helpers Subsystem (helpers.js)
 * Purpose: General purpose JavaScript utility functions for money formatting,
 * debouncing, throttling, smooth slide animations, and section fetching.
 */

(function () {
  'use strict';

  window.ShopziCurious = window.ShopziCurious || {};
  window.Kaizen = window.ShopziCurious;
  ShopziCurious.helpers = ShopziCurious.helpers || {};

  /**
   * Debounce execution of a function
   */
  ShopziCurious.helpers.debounce = function (fn, wait = 250) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  };

  /**
   * Throttle execution of a function
   */
  ShopziCurious.helpers.throttle = function (fn, limit = 100) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  /**
   * Shopify Currency Formatter
   * Converts cents to formatted money string (e.g. 1999 -> $19.99)
   */
  ShopziCurious.helpers.formatMoney = function (cents, format = '${{amount}}') {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    let value = '';
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    const centsNum = parseInt(cents, 10) || 0;

    function formatWithDelimiters(number, precision = 2, thousands = ',', decimal = '.') {
      if (isNaN(number) || number == null) {
        return 0;
      }
      number = (number / 100).toFixed(precision);
      const parts = number.split('.');
      const dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      const centsPart = parts[1] ? decimal + parts[1] : '';
      return dollars + centsPart;
    }

    switch (format.match(placeholderRegex)?.[1]) {
      case 'amount':
        value = formatWithDelimiters(centsNum, 2, ',', '.');
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(centsNum, 0, ',', '.');
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(centsNum, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(centsNum, 0, ' ', '');
        break;
      default:
        value = formatWithDelimiters(centsNum, 2, ',', '.');
        break;
    }

    return format.replace(placeholderRegex, value);
  };

  /**
   * Fetch Section HTML via Shopify Section Rendering API
   */
  ShopziCurious.helpers.fetchSectionHTML = async function (sectionId, urlParams = '') {
    const url = `${window.location.pathname}?section_id=${sectionId}${urlParams ? '&' + urlParams : ''}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const text = await response.text();
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(text, 'text/html');
      return htmlDoc.getElementById(`shopify-section-${sectionId}`) || htmlDoc.body;
    } catch (error) {
      console.error(`[ShopziCurious] Failed to fetch section ${sectionId}:`, error);
      return null;
    }
  };

  /**
   * JavaScript Accordion Slide Up Animation
   */
  ShopziCurious.helpers.slideUp = function (target, duration = 300) {
    target.style.transitionProperty = 'height, margin, padding';
    target.style.transitionDuration = duration + 'ms';
    target.style.boxSizing = 'border-box';
    target.style.height = target.offsetHeight + 'px';
    target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = '0';
    target.style.paddingTop = '0';
    target.style.paddingBottom = '0';
    target.style.marginTop = '0';
    target.style.marginBottom = '0';
    window.setTimeout(() => {
      target.style.display = 'none';
      target.style.removeProperty('height');
      target.style.removeProperty('padding-top');
      target.style.removeProperty('padding-bottom');
      target.style.removeProperty('margin-top');
      target.style.removeProperty('margin-bottom');
      target.style.removeProperty('overflow');
      target.style.removeProperty('transition-duration');
      target.style.removeProperty('transition-property');
    }, duration);
  };

  /**
   * JavaScript Accordion Slide Down Animation
   */
  ShopziCurious.helpers.slideDown = function (target, duration = 300) {
    target.style.removeProperty('display');
    let display = window.getComputedStyle(target).display;

    if (display === 'none') display = 'block';

    target.style.display = display;
    const height = target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = '0';
    target.style.paddingTop = '0';
    target.style.paddingBottom = '0';
    target.style.marginTop = '0';
    target.style.marginBottom = '0';
    target.offsetHeight;
    target.style.boxSizing = 'border-box';
    target.style.transitionProperty = 'height, margin, padding';
    target.style.transitionDuration = duration + 'ms';
    target.style.height = height + 'px';
    target.style.removeProperty('padding-top');
    target.style.removeProperty('padding-bottom');
    target.style.removeProperty('margin-top');
    target.style.removeProperty('margin-bottom');
    window.setTimeout(() => {
      target.style.removeProperty('height');
      target.style.removeProperty('overflow');
      target.style.removeProperty('transition-duration');
      target.style.removeProperty('transition-property');
    }, duration);
  };

  /**
   * Toggle Slide State
   */
  ShopziCurious.helpers.slideToggle = function (target, duration = 300) {
    if (window.getComputedStyle(target).display === 'none') {
      return ShopziCurious.helpers.slideDown(target, duration);
    } else {
      return ShopziCurious.helpers.slideUp(target, duration);
    }
  };
})();
