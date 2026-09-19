# ShopziCurious RTL/LTR Compatibility Audit

**Date**: September 19, 2026  
**Auditor**: Antigravity Theme Architecture & RTL Systems Inspector  
**Theme**: ShopziCurious (Custom Shopify Public Theme)  
**Status**: COMPLETE AUDIT — REPORT ONLY (Zero theme source files modified)  
**Baseline Theme Check**: 156 files inspected, 0 offenses detected  

---

## 1. Audit Summary

A comprehensive, read-only Right-to-Left (RTL) and Left-to-Right (LTR) architectural audit was performed across the entire ShopziCurious Shopify theme. The audit verified bi-directional document declarations, CSS flexbox/grid flow, physical vs. logical CSS properties, absolute/fixed element positioning, JavaScript carousel coordinate math, touch/swipe handling, directional SVGs, and locale detection.

### Audit Statistics:
- **Total Files Inspected**: 135 theme code files
- **CSS Files Reviewed**: 14 files (`assets/*.css`)
- **JS Files Reviewed**: 12 files (`assets/*.js`)
- **Sections Reviewed**: 46 files (`sections/*.liquid`)
- **Snippets Reviewed**: 32 files (`snippets/*.liquid`)
- **Templates Reviewed**: 15 files (`templates/*.json`, `templates/*.liquid`)
- **Layouts Reviewed**: 2 files (`layout/theme.liquid`, `layout/password.liquid`)
- **Locales Inspected**: 14 files (`locales/*.json`, `locales/*.schema.json`)

### Major RTL/LTR Risk Areas:
1. **Slider / Carousel JavaScript Math**: Every slider and carousel in the theme (`slider.js`, `explore-collections.liquid`, `recent-blog-posts.liquid`, `main-product.liquid`, `main-collection.liquid`, `recently-viewed-products.liquid`) assumes positive `offsetLeft` and left-to-right `scrollLeft` / `translateX(-...)`. In RTL, these in-page carousels invert swipe, break thumbnail synchronization, or scroll off-screen.
2. **Selector Mismatches in Existing `assets/rtl.css`**: The legacy `rtl.css` file contains outdated selectors targeting elements that were renamed or refactored (e.g. `.szc-mobile-drawer__inner` instead of `.szc-mobile-drawer__panel`, `.szc-facets-drawer__inner` instead of `.szc-filter-drawer`), preventing mobile navigation and collection filter drawers from properly opening from the right.
3. **Locale Code Matching in Layout**: `layout/theme.liquid` uses strict equality (`== 'ar'`) which fails for international regional sub-locales like `ar-SA`, `ar-AE`, `ar-EG`, `he-IL`.
4. **Directional UI Elements & Asymmetrical Layouts**: Form input borders and radius pairings (newsletter forms in footer and blog), absolute badges on product cards and wishlist tiles, and asymmetrical editorial layouts (`style-that-speaks.liquid`).

---

## 2. Critical Issues

---

### RTL-001 — Sub-Locale RTL Detection Failure in Layout
- **File**: `layout/theme.liquid`
- **Line/selector/function**: Line 2 & Line 43 (`<html ... dir="...">` and `{{ 'rtl.css' | stylesheet_tag }}`)
- **Issue**: Strict string equality `request.locale.iso_code == 'ar'` fails for regional RTL locales.
- **Current LTR behavior**: LTR is assigned whenever the language code is not exactly `'ar'`, `'he'`, `'fa'`, or `'ur'`.
- **Expected RTL behavior**: Any locale starting with or containing an RTL language code (e.g., `ar-SA`, `ar-AE`, `ar-EG`, `he-IL`) must receive `dir="rtl"` and load `assets/rtl.css`.
- **Why it breaks in RTL**: Shopify Markets frequently generates regional locale codes with country suffixes (e.g., `ar-SA` for Saudi Arabia, `ar-AE` for UAE). When a customer selects Arabic (Saudi Arabia), `request.locale.iso_code == 'ar'` evaluates to `false`. The entire page renders in `dir="ltr"` and `rtl.css` is completely omitted.
- **Recommended fix direction**: Update condition to check language root: `{% assign lang_iso = request.locale.iso_code | downcase | slice: 0, 2 %}{% if lang_iso == 'ar' or lang_iso == 'he' or lang_iso == 'fa' or lang_iso == 'ur' %}` in both `layout/theme.liquid` and `layout/password.liquid`.
- **Severity**: Critical

---

### RTL-002 — Mobile Navigation Drawer Selector Mismatch in `assets/rtl.css`
- **File**: `assets/rtl.css` & `snippets/mobile-drawer.liquid`
- **Line/selector/function**: `assets/rtl.css:101-109` (`html[dir="rtl"] .szc-mobile-drawer__inner`)
- **Issue**: `rtl.css` targets a non-existent CSS class `.szc-mobile-drawer__inner`.
- **Current LTR behavior**: `.szc-mobile-drawer__panel` is pinned to `left: 0` with `transform: translateX(-100%)`. Opening the drawer animates it to `translateX(0)`.
- **Expected RTL behavior**: In RTL, the drawer panel should be pinned to the right (`right: 0; left: auto;`) and animate from `transform: translateX(100%)` to `translateX(0)`.
- **Why it breaks in RTL**: The markup in `snippets/mobile-drawer.liquid:12` uses `.szc-mobile-drawer__panel`, but `assets/rtl.css` targets `.szc-mobile-drawer__inner`. Because the selector does not match, the panel retains its LTR rule (`left: 0; transform: translateX(-100%)`). When a user on an RTL page clicks the hamburger menu, the mobile menu erroneously slides in from the left.
- **Recommended fix direction**: Update `assets/rtl.css` to target `.szc-mobile-drawer__panel` (`right: 0 !important; left: auto !important; transform: translateX(100%) !important;`).
- **Severity**: Critical

---

### RTL-003 — Collection Filter Drawer Selector Mismatch in `assets/rtl.css`
- **File**: `assets/rtl.css` & `sections/main-collection.liquid`
- **Line/selector/function**: `assets/rtl.css:117-124` (`html[dir="rtl"] .szc-facets-drawer__inner`)
- **Issue**: `rtl.css` targets `.szc-facets-drawer__inner`, but the section markup uses `.szc-filter-drawer`.
- **Current LTR behavior**: `.szc-filter-drawer` has `left: 0; transform: translateX(-100%)`.
- **Expected RTL behavior**: The filter drawer should slide out from the right (`right: 0; left: auto; transform: translateX(100%)`).
- **Why it breaks in RTL**: Because `.szc-facets-drawer__inner` does not exist in `sections/main-collection.liquid`, the RTL override is completely ignored. The filter drawer stays anchored to the left physical edge of the viewport.
- **Recommended fix direction**: Update `assets/rtl.css` to target `.szc-filter-drawer` and `.szc-filter-drawer__inner` with `right: 0 !important; left: auto !important; transform: translateX(100%) !important; box-shadow: -4px 0 24px rgba(0,0,0,0.12) !important;`.
- **Severity**: Critical

---

### RTL-004 — Inverted Carousel Coordinate & Translation Math Across Sliders
- **File**: `assets/slider.js`, `sections/recent-blog-posts.liquid`, `sections/main-product.liquid`, `sections/explore-collections.liquid`, `sections/main-collection.liquid`
- **Line/selector/function**: 
  - `assets/slider.js:82-87` (`handleSwipe()`)
  - `sections/recent-blog-posts.liquid:645, 827` (`updatePosition()`, `targetIndex = currentIndex + (diffX < 0 ? 1 : -1)`)
  - `sections/main-product.liquid:3455, 3532, 4127` (`scrollToSlide()`, `scrollPos / slideWidth`, `updatePosition()`)
  - `sections/explore-collections.liquid:1202, 1237, 1476` (`getTargetScroll()`, `track.scrollLeft -= setStride`, `diffX`)
  - `sections/main-collection.liquid:1597` (`track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)'`)
- **Issue**: Hardcoded assumptions that forward movement is negative translateX (`-offsetLeft`) or positive `scrollLeft`, and that swiping left advances forward.
- **Current LTR behavior**: Swiping left or clicking next translates the track by `-X` or scrolls forward in positive `scrollLeft`.
- **Expected RTL behavior**: In RTL, the reading origin is on the right. Moving to the next slide requires positive translateX (`+X`) or inverted `scrollLeft`, and swiping to the left moves backwards in the timeline.
- **Why it breaks in RTL**: 
  1. In `sections/main-collection.liquid:1597`, translating `-100% * index` pushes slides further off-screen to the left away from the viewport.
  2. In `sections/main-product.liquid:3532`, modern browsers report `scrollLeft <= 0` in RTL, causing `Math.round(scrollPos / slideWidth)` to return negative numbers, breaking thumbnail highlight synchronization completely.
  3. In `explore-collections.liquid`, boundary normalization swaps `track.scrollLeft` assuming positive scalar values, causing the carousel to jump violently or get stuck during drag.
- **Recommended fix direction**: Introduce an RTL check (`const isRTL = document.documentElement.getAttribute('dir') === 'rtl' || document.dir === 'rtl';`) in each slider engine, invert the transform scalar (`isRTL ? targetX : -targetX`), and handle RTL `scrollLeft` normalization.
- **Severity**: Critical

---

### RTL-005 — Multi-Level Flyout Submenu Opens Off-Screen to the Right
- **File**: `sections/header.liquid`
- **Line/selector/function**: Lines 633-649 (`.szc-header__sub-dropdown`) & Line 233 (`.szc-header__sub-chevron`)
- **Issue**: Nested flyout menus in Header Type 3 (Simple Dropdown) are hardcoded with `left: 100%` and `transform: translateX(6px)`.
- **Current LTR behavior**: Hovering a dropdown item opens its submenu to the right (`left: 100%`).
- **Expected RTL behavior**: The submenu should fly out towards the left (`right: 100%; left: auto; transform: translateX(-6px)`), and the arrow should point left (`<`).
- **Why it breaks in RTL**: In RTL, the main dropdown is anchored to the right side of the menu link. Flying out at `left: 100%` opens the submenu towards the right edge, causing it to render across the parent link or clip off the right edge of the screen.
- **Recommended fix direction**: Add RTL rules in `assets/rtl.css`:
  ```css
  html[dir="rtl"] .szc-header__sub-dropdown {
    left: auto !important;
    right: 100% !important;
    transform: translateX(-6px) !important;
  }
  html[dir="rtl"] .szc-header__dropdown-item:hover > .szc-header__sub-dropdown {
    transform: translateX(0) !important;
  }
  html[dir="rtl"] .szc-header__sub-chevron {
    transform: scaleX(-1) !important;
    margin-left: 0 !important;
    margin-right: auto !important;
  }
  ```
- **Severity**: High

---

### RTL-006 — Product Card Badges & Action Buttons Positioning Inverted
- **File**: `snippets/product-card.liquid`
- **Line/selector/function**: Lines 517-536 (`.szc-product-card__badges`, `.szc-product-card__actions`)
- **Issue**: Badges (Sale, New, Sold Out) are hardcoded to `left: 10px`, while Wishlist and Quick View action buttons are hardcoded to `right: 12px`.
- **Current LTR behavior**: Badges appear at top-left; action buttons appear at top-right.
- **Expected RTL behavior**: Badges should appear at top-right (inline-start: 10px), and action buttons at top-left (inline-end: 12px).
- **Why it breaks in RTL**: In RTL interfaces, visual hierarchy dictates that primary status badges appear on the start edge (right), while interactive tools sit on the end edge (left). Currently, `assets/rtl.css` only overrides `.szc-product__badges` (in `main-product.liquid`), leaving all cards in grids un-flipped.
- **Recommended fix direction**: In `snippets/product-card.liquid` or `assets/rtl.css`:
  ```css
  html[dir="rtl"] .szc-product-card__badges {
    left: auto !important;
    right: 10px !important;
  }
  html[dir="rtl"] .szc-product-card__actions {
    right: auto !important;
    left: 12px !important;
  }
  ```
- **Severity**: High

---

### RTL-007 — Wishlist Card Checkbox, Remove Button & List View Actions
- **File**: `snippets/main-wishlist-content.liquid`
- **Line/selector/function**: Lines 438, 501-512 (`.szc-wishlist-card__select`, `.szc-wishlist-card__remove`, `.szc-wishlist-card__actions`)
- **Issue**: Select checkbox is pinned to `left: 16px`, delete heart button is pinned to `right: 16px`, and list view actions use `margin-left: auto !important`.
- **Current LTR behavior**: Checkbox at top-left, delete button at top-right, and list CTA aligned to the right edge.
- **Expected RTL behavior**: Checkbox at top-right, delete button at top-left, and list CTA aligned to the left edge with `margin-right: auto; margin-left: 0`.
- **Why it breaks in RTL**: Checkbox and remove buttons overlap opposite visual corners in RTL, and list view actions sit on the wrong side of the row.
- **Recommended fix direction**:
  ```css
  html[dir="rtl"] .szc-wishlist-card__select {
    left: auto !important;
    right: 16px !important;
  }
  html[dir="rtl"] .szc-wishlist-card__remove {
    right: auto !important;
    left: 16px !important;
  }
  html[dir="rtl"] .szc-wishlist-grid.is-list-view .szc-wishlist-card__actions {
    margin-left: 0 !important;
    margin-right: auto !important;
  }
  ```
- **Severity**: High

---

### RTL-008 — Predictive Search Modal Input Margins, Chevrons & Hover Shifts
- **File**: `snippets/predictive-search-modal.liquid`
- **Line/selector/function**: Lines 323, 366, 537, 572
- **Issue**: Search icon has `margin-right: 12px`, close button has `margin-left: 8px`, collection chevrons point right, and hover translates `translateX(3px)`.
- **Current LTR behavior**: Search icon on left with right margin; close button on right with left margin; chevrons point right.
- **Expected RTL behavior**: Search icon on right with left margin (`margin-inline-end: 12px`); close button on left with right margin (`margin-inline-start: 8px`); chevrons point left (`<`); hover translates `translateX(-3px)`.
- **Why it breaks in RTL**: Physical margins cause awkward spacing between input text and icons in RTL; chevrons point in the opposite direction of destination pages.
- **Recommended fix direction**: Use logical margins (`margin-inline-end`, `margin-inline-start`), mirror collection arrows in RTL, and negate hover translations:
  ```css
  html[dir="rtl"] .szc-search-icon-input {
    margin-right: 0 !important;
    margin-left: 12px !important;
  }
  html[dir="rtl"] .szc-search-close-btn {
    margin-left: 0 !important;
    margin-right: 8px !important;
  }
  html[dir="rtl"] .szc-search-collection-arrow,
  html[dir="rtl"] .szc-search-view-all-btn svg {
    transform: scaleX(-1) !important;
  }
  html[dir="rtl"] .szc-search-view-all-btn:hover {
    transform: translateX(-3px) !important;
  }
  ```
- **Severity**: High

---

### RTL-009 — Newsletter Form Border-Radius & Border Inversion in Footer & Section
- **File**: `sections/footer.liquid` & `sections/newsletter.liquid`
- **Line/selector/function**: `sections/footer.liquid:564-586`, `sections/newsletter.liquid:304-329`
- **Issue**: Text input has `border-right: none; border-radius: 6px 0 0 6px;`, submit button has `border-radius: 0 6px 6px 0;`.
- **Current LTR behavior**: Input on left with rounded left corners; button on right with rounded right corners.
- **Expected RTL behavior**: Input on right with rounded right corners (`border-radius: 0 6px 6px 0; border-left: none; border-right: 1px solid ...`), button on left with rounded left corners (`border-radius: 6px 0 0 6px`).
- **Why it breaks in RTL**: Flexbox automatically places the submit button on the left and input on the right in RTL. Because the border-radius and `border-right: none` are hardcoded physical properties, the input's outer exposed edge has square corners and is missing its border, while the rounded corners awkwardly point into the seam between input and button.
- **Recommended fix direction**: In `assets/rtl.css`:
  ```css
  html[dir="rtl"] .szc-footer__newsletter-input,
  html[dir="rtl"] .szc-newsletter__input {
    border-right: 1px solid var(--szc-color-border, #e0dad0) !important;
    border-left: none !important;
    border-radius: 0 6px 6px 0 !important;
  }
  html[dir="rtl"] .szc-footer__newsletter-btn,
  html[dir="rtl"] .szc-newsletter__submit {
    border-radius: 6px 0 0 6px !important;
  }
  html[dir="rtl"] .szc-arrow-icon {
    transform: scaleX(-1) !important;
  }
  ```
- **Severity**: Medium

---

### RTL-010 — Countdown Timer Component Sequence Reversal
- **File**: `sections/countdown-timer.liquid`
- **Line/selector/function**: Line 50 (`.szc-countdown__timer`)
- **Issue**: Standard `flex-direction: row` reverses the time unit order in RTL.
- **Current LTR behavior**: Displays `[Days] : [Hours] : [Minutes] : [Seconds]`.
- **Expected RTL behavior**: Displays `[Days] : [Hours] : [Minutes] : [Seconds]` (hierarchical time units always read largest to smallest).
- **Why it breaks in RTL**: Because the timer container is a flex row, CSS in RTL reverses the order of child elements, rendering `[Seconds] : [Minutes] : [Hours] : [Days]`. This causes digital timers to appear counting in reverse.
- **Recommended fix direction**: Force LTR direction on the timer grid:
  ```css
  html[dir="rtl"] .szc-countdown__timer {
    direction: ltr !important;
  }
  ```
- **Severity**: Medium

---

### RTL-011 — Select Dropdown Arrow & Padding Inversion
- **File**: `assets/forms.css`
- **Line/selector/function**: Lines 82-97 (`.szc-select-wrapper::after`, `.szc-select`)
- **Issue**: Custom dropdown caret is positioned at `right: var(--szc-space-4)`, and select input has `padding-right: var(--szc-space-10)`.
- **Current LTR behavior**: Arrow icon on right, extra right padding to prevent text collision.
- **Expected RTL behavior**: Arrow icon on left (`left: var(--szc-space-4); right: auto;`), extra left padding (`padding-left: var(--szc-space-10); padding-right: var(--szc-space-4);`).
- **Why it breaks in RTL**: In RTL, browser select options and text start on the right. With `right: 16px` positioning, the arrow icon sits directly on top of the first Arabic/Hebrew letters, while the left side has empty padding.
- **Recommended fix direction**:
  ```css
  html[dir="rtl"] .szc-select-wrapper::after {
    right: auto !important;
    left: var(--szc-space-4) !important;
  }
  html[dir="rtl"] .szc-select {
    padding-right: var(--szc-space-4) !important;
    padding-left: var(--szc-space-10) !important;
  }
  ```
- **Severity**: Medium

---

### RTL-012 — Phone Number Bidi / Garbled Formatting in Announcement Bar
- **File**: `sections/announcement-bar.liquid`
- **Line/selector/function**: Line 178 (`.szc-announcement-bar__phone-text`)
- **Issue**: Phone numbers containing `+`, `-`, or `()` are rendered without explicit text direction isolation.
- **Current LTR behavior**: Phone number displays correctly: `+1 (800) 123-4567`.
- **Expected RTL behavior**: Phone number retains left-to-right number ordering: `+1 (800) 123-4567`.
- **Why it breaks in RTL**: In bidirectional text rendering, punctuation and symbols inside Arabic/Hebrew context flip according to Unicode Bidirectional Algorithm (UBA), turning `+1 (800) 123-4567` into `(800) 123-4567 1+`.
- **Recommended fix direction**: Add `direction: ltr; unicode-bidi: isolate;` to phone number strings:
  ```css
  html[dir="rtl"] .szc-announcement-bar__phone-link,
  html[dir="rtl"] .szc-announcement-bar__phone-text {
    direction: ltr !important;
    unicode-bidi: isolate !important;
    display: inline-flex !important;
  }
  ```
- **Severity**: Medium

---

### RTL-013 — Editorial Canvas Hardcoded Absolute Coordinates in `style-that-speaks.liquid`
- **File**: `sections/style-that-speaks.liquid`
- **Line/selector/function**: Lines 478-574 (`.szc-sts__heading-group`, `.szc-sts__top-right`, `.szc-sts__bottom-left`, `.szc-sts__bottom-right`)
- **Issue**: Asymmetrical editorial layout positions cards and headings using rigid physical coordinates (`left: 7.2%`, `right: 7.2%`, `left: 55%`).
- **Current LTR behavior**: Giant typography on top-left, supporting cards on right and lower-left, narrative text on bottom-right.
- **Expected RTL behavior**: Editorial canvas should mirror: giant typography on top-right, supporting cards on left and lower-right, narrative text on bottom-left.
- **Why it breaks in RTL**: The layout stays locked to LTR coordinates. The editorial headline remains on the left while Arabic/Hebrew text aligns right inside its bounding box, creating disjointed whitespace and breaking the intended fashion editorial composition.
- **Recommended fix direction**: In `assets/rtl.css`:
  ```css
  html[dir="rtl"] .szc-sts__heading-group {
    left: auto !important;
    right: 7.2% !important;
  }
  html[dir="rtl"] .szc-sts__top-right {
    right: auto !important;
    left: 7.2% !important;
  }
  html[dir="rtl"] .szc-sts__bottom-left {
    left: auto !important;
    right: 7.2% !important;
  }
  html[dir="rtl"] .szc-sts__bottom-right {
    left: 7.2% !important;
    right: 55% !important;
  }
  html[dir="rtl"] .szc-sts__cta-link:hover .szc-sts__cta-arrow {
    transform: translateX(-4px) !important;
  }
  ```
- **Severity**: Medium

---

### RTL-014 — Continuous Marquee CSS Keyframes Flow Opposite to Reading Direction
- **File**: `sections/diagonal-marquee.liquid`, `sections/brand-features.liquid`, `sections/instagram-gallery.liquid`
- **Line/selector/function**:
  - `sections/diagonal-marquee.liquid:391-407` (`szc-marquee-move-left`)
  - `sections/brand-features.liquid:231-238` (`szc-brand-marquee`)
  - `sections/instagram-gallery.liquid:487-503` (`szc-insta-marquee-left`)
- **Issue**: CSS keyframes translate tracks from `translate3d(0,0,0)` to `translate3d(-50%,0,0)`.
- **Current LTR behavior**: Marquee smoothly pulls content from right to left.
- **Expected RTL behavior**: In RTL, tracks anchored to the right edge must animate from `0` to `+50%` (or reverse animation direction) to avoid revealing empty space.
- **Why it breaks in RTL**: Because RTL switches the flex alignment origin to the right, translating negative percentage pushes the track into the left overflow, causing the right edge of the screen to show a blank gap before the loop resets.
- **Recommended fix direction**: In `assets/rtl.css`, flip the marquee keyframe translation directions or add `animation-direction: reverse;` for RTL.
- **Severity**: Medium

---

### RTL-015 — Directional SVGs & Arrows Missing RTL Mirroring
- **File**: Multiple (`snippets/pagination.liquid`, `snippets/mega-menu.liquid`, `sections/article.liquid`, `sections/main-404.liquid`, `sections/cart.liquid`)
- **Line/selector/function**:
  - `snippets/pagination.liquid:93, 132` (`.szc-pagination__icon`)
  - `snippets/mega-menu.liquid:57, 92, 127` (`.szc-view-all-svg`)
  - `sections/article.liquid:85` (`.szc-icon--back`)
  - `sections/main-404.liquid:30` (`.szc-button__icon`)
  - `sections/cart.liquid:16` (`.szc-cart-page__continue svg`)
- **Issue**: Inline SVG icons indicating forward/backward navigation are unmirrored right-pointing arrows (`→` or `>`).
- **Current LTR behavior**: "Next", "View All", and "Continue" arrows point right. "Back" arrows point left.
- **Expected RTL behavior**: "Next", "View All", and "Continue" arrows must point left (`←` or `<`). "Back" arrows must point right (`→`).
- **Why it breaks in RTL**: In RTL, forward progression is to the left, and backward return is to the right. Unmirrored arrows point in the exact opposite direction of the action.
- **Recommended fix direction**: Add targeted SVG mirroring rules in `assets/rtl.css`:
  ```css
  html[dir="rtl"] .szc-pagination__icon,
  html[dir="rtl"] .szc-view-all-svg,
  html[dir="rtl"] .szc-icon--back,
  html[dir="rtl"] .szc-cart-page__continue svg,
  html[dir="rtl"] .szc-promo-banner__btn-arrow svg,
  html[dir="rtl"] .szc-button--primary .szc-button__icon {
    transform: scaleX(-1) !important;
  }
  ```
- **Severity**: Medium

---

## 3. Header & Navigation Issues

1. **Header Top Row Localization Dropdowns**:
   - `snippets/language-selector.liquid:152` uses `right: 0`. When placed on the left side of the header in LTR, it expands inward; in RTL, it needs `left: 0` / `right: auto` adjustments depending on its position relative to the screen edge.
   - `snippets/country-selector.liquid:356` uses `margin-left: 2px` on the active checkmark icon instead of `margin-inline-start`.
2. **Header Badges**:
   - `assets/rtl.css:55-59` overrides `.szc-header__wishlist-badge` and `.szc-header__cart-badge` to `left: -6px !important; right: auto !important;`, which correctly flips header icon count badges in RTL.
3. **Sticky Header Transition**:
   - `assets/header.js` operates purely on vertical `scrollTop`, directionally neutral and safe.
4. **Header Two-Level Layout Flex Flow**:
   - Desktop header top and bottom rows use `display: flex; justify-content: space-between;`. In RTL, flex row automatically places the language/country selectors on the right, the center logo in the middle, and the search/account/wishlist/cart actions on the left.

---

## 4. Mega Menu Issues

1. **Mega Menu Type 1 (Image Left)**:
   - In RTL, `flex-direction: row` causes `.szc-mega-col--banner` (the first child) to display on the RIGHT edge of the mega menu panel. This naturally aligns with RTL reading order (editorial image first, followed by category links).
   - Category sub-list indentation: `sections/header.liquid:936` has `.szc-mega-subcategories-list { padding: 6px 0 0 40px; }`. In RTL, this indents from the left instead of the right! It must use `padding: 6px 40px 0 0 !important;` (already in `assets/rtl.css:48`).
2. **Mega Menu Type 2 (Products Right)**:
   - In RTL, `.szc-mega-menu__left-nav` (navigation link columns) shifts to the right, and `.szc-mega-col--showcase` (product showcase cards) shifts to the left.
   - Showcase card badge: `sections/header.liquid:1157` has `.szc-showcase-badge { left: 8px; }`. In RTL, badges must sit on `right: 8px !important; left: auto !important;`.
3. **Mega Menu Type 3 (Simple Dropdown & Multi-Level Flyouts)**:
   - Submenu flyout is hardcoded to `left: 100%` (Issue `RTL-005`).
   - Submenu chevron `.szc-header__sub-chevron` has `margin-left: auto` and points right (`>`). In RTL, it must have `margin-right: auto` and point left (`<`).
4. **Hover Translations**:
   - `sections/header.liquid:1002`: `.szc-mega-product-item:hover { transform: translateX(3px); }`. Must be `transform: translateX(-3px) !important;` in RTL (present in `assets/rtl.css:52`).
   - `sections/header.liquid:1237`: `.szc-mega-view-all-link:hover .szc-view-all-svg { transform: translateX(4px); }`. Must translate negative (`-4px`) in RTL.

---

## 5. Search & Predictive Search Issues

1. **Predictive Search Form**:
   - Search icon `margin-right: 12px` and close button `margin-left: 8px` (Issue `RTL-008`).
   - Input text alignment: In RTL, placeholder and input text should align right.
2. **3-Column Results Grid**:
   - `snippets/predictive-search-modal.liquid:377`: `grid-template-columns: 200px 1.35fr 1fr;`. In RTL, CSS Grid automatically flips column order from right to left (Column 1: Trending Searches on right, Column 2: Products in center, Column 3: Collections on left).
3. **Collection Cards**:
   - Collection arrow `.szc-search-collection-arrow` points right (`>`). Must be mirrored (`scaleX(-1)`) in RTL.
4. **View All Results Button**:
   - Arrow icon points right and animates `translateX(3px)`. Must be mirrored and animate `translateX(-3px)`.

---

## 6. Product / Collection Issues

1. **Product Cards**:
   - Badges top-left vs top-right (Issue `RTL-006`).
   - Compare-at price: In `assets/rtl.css:86-88`, `.szc-price--compare` is given `margin-left: 6px !important; margin-right: 0 !important;`.
   - Star rating & review count: Flex row with `gap: 6px`, naturally aligns in RTL.
2. **Collection Facets & Toolbar**:
   - Filter drawer class mismatch (Issue `RTL-003`).
   - Active filter tags (pills): Remove `X` button has `margin-left: 6px`. In RTL, it needs `margin-right: 6px; margin-left: 0`.
   - Grid column view switcher (2, 3, 4 columns): Symmetrical and safe.
   - Sort dropdown: Needs logical select padding and caret position (Issue `RTL-011`).
3. **Main Product Details**:
   - Gallery thumbnails: Vertical on desktop (safe), horizontal on mobile (swiping broken in RTL due to negative `scrollLeft`).
   - Specification tables: `sections/main-product.liquid:2402` has `.szc-tab-pane table { text-align: left; }`. Must be `text-align: right;` in RTL.
   - Quantity stepper: `[ - ] [ Qty ] [ + ]`. In `assets/rtl.css:154`, `.szc-quantity` has `flex-direction: row !important;` to preserve minus on left and plus on right, or it flips.
   - Summary bullet list: In `assets/rtl.css:144-150`, list bullets are adjusted to `padding-right: 20px; padding-left: 0;` and `::before` pinned to `right: 0; left: auto;`.

---

## 7. Cart / Drawer Issues

1. **Slide-Out AJAX Cart Drawer**:
   - `assets/rtl.css:67-78` correctly inverts drawer slide origin: `justify-content: flex-start !important;` and `transform: translateX(-100%) !important;`.
   - Free shipping progress bar: Fills from left to right (`style="width: X%"`). In RTL, progress bars should fill from right to left (`transform-origin: right center`).
   - Line item remove button: Overridden in `assets/rtl.css:80-83` with `margin-right: auto !important; margin-left: 0 !important;`.
2. **Dedicated Cart Page (`sections/cart.liquid`)**:
   - Line item remove button and action buttons lack RTL margin rules.
   - Table columns: `szc-cart-col--total` has `text-align: right` on desktop. In RTL, this aligns text away from the outer edge.
   - Mobile cart view: `sections/cart.liquid:998` enforces `text-align: left;` on mobile for price, quantity, and total! In RTL on mobile, this forces text to align to the left side!

---

## 8. Slider / Carousel Issues

This is the **highest technical risk area** in the entire theme:

| Component / Section | File | Slider Type | RTL Issue Detail |
|---|---|---|---|
| `<theme-slider>` | `assets/slider.js` | Web Component | `handleSwipe()` assumes `touchEndX < touchStartX` is `next()`. Swiping is inverted in RTL. `targetSlide.offsetLeft` scroll target is unreliable in RTL. |
| Explore Collections | `sections/explore-collections.liquid` | Touch/Mouse Drag | Boundary normalization `track.scrollLeft -= setStride` and drag math `mouseStartScrollLeft - diffX` assume positive LTR scrolling. Breaks during drag in RTL. |
| Recent Blog Posts | `sections/recent-blog-posts.liquid` | 3D Transform Track | `targetX = -offsetLeft` translates track in the wrong direction; arrow navigation and touch drag logic are inverted. |
| Product Related Carousel | `sections/main-product.liquid` | 3D Transform Track | Exact clone of blog carousel engine; negative translation and drag math invert in RTL. |
| Product Media Gallery | `sections/main-product.liquid` | Native Horizontal Scroll | `detectedIdx = Math.round(scrollPos / slideWidth)` returns negative indices in RTL, permanently breaking mobile thumbnail highlight sync. |
| Scroll Reveal Gallery | `sections/scroll-reveal-gallery.liquid` | Mobile Horizontal Scroll | `Math.round(trackLeft / cardWidth)` clamped with `Math.max(0, ...)` fails when `scrollLeft` is negative in RTL. Mobile dots never update. |
| Instagram Reels | `sections/instagram-reels.liquid` | Scroll Snap | `this.track.scrollLeft = scrollTarget` uses positive LTR offset to center the dominant smartphone mockup, failing in RTL. |
| Collection Promo Slider | `sections/main-collection.liquid` | Transform Track | `track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)'` pushes slides off-screen to the left in RTL. |
| Recently Viewed Strip | `sections/recently-viewed-products.liquid` | ScrollBy Button Nav | SVG arrows are visually mirrored by `rtl.css`, but JS still calls `scrollBy({ left: -scrollAmount })`, causing buttons to scroll in the opposite direction. |

---

## 9. Custom Section Issues

1. **`sections/hero-banner.liquid`**:
   - Classic slider: Uses fade/opacity transitions (`.szc-hero-banner__slide.is-active`), which is directionally neutral and 100% RTL safe.
   - Hover panels: `grid.scrollTo({ left: grid.offsetWidth * i, behavior: 'smooth' })` uses positive left offset. In RTL, horizontal scroll origin is on the right.
2. **`sections/feature-icons-bar.liquid`**:
   - 4-column USP bar: Uses flexbox with `gap: 14px`. Cleanly mirrors in RTL. Directionally safe.
3. **`sections/diagonal-marquee.liquid`**:
   - Marquee tracks translate `translate3d(0,0,0)` to `translate3d(-100%,0,0)`. In RTL, pulling negative shifts content away from the start edge (Issue `RTL-014`).
4. **`sections/promo-banner.liquid`**:
   - Hover arrow translates `translateX(3px)`. Needs `translateX(-3px)` in RTL.
5. **`sections/scroll-reveal-gallery.liquid`**:
   - Desktop view: Staggered lifestyle gallery with vertical scroll triggers; directionally safe.
   - Mobile view: Horizontal scroll track with broken dot synchronization in RTL (Issue `RTL-004`).
6. **`sections/explore-collections.liquid`**:
   - Infinite 3D carousel track and drag math assumptions (Issue `RTL-004`).
7. **`sections/style-that-speaks.liquid`**:
   - Asymmetrical editorial canvas with hardcoded LTR absolute positioning (Issue `RTL-013`).
8. **`sections/brand-features.liquid`**:
   - Marquee keyframes translate `-50%` (Issue `RTL-014`).
9. **`sections/countdown-timer.liquid`**:
   - Sequential flex row reverses time units to `Secs : Mins : Hours : Days` (Issue `RTL-010`).
10. **`sections/sticky-story-showcase.liquid`**:
    - Dual-column sticky scroll: Narrative on right, sticky media on left in RTL. Clean and functional. Hotspot tooltips need logical alignment.
11. **`sections/instagram-gallery.liquid`**:
    - Dual-row marquee translates negative percentage (Issue `RTL-014`).
12. **`sections/instagram-reels.liquid`**:
    - Staggered portrait cards mirror naturally; mobile centering script needs RTL scroll offset fix.
13. **`sections/recent-blog-posts.liquid`**:
    - Infinite carousel transform math inverts in RTL (Issue `RTL-004`).
14. **`sections/bottom-usp-bar.liquid`**:
    - 4 circular badge pillars: Flexbox layout with `gap: 14px`. Directionally safe.

---

## 10. CSS Directional Issues

The following physical CSS properties create actual RTL layout defects:

1. **`sections/header.liquid:636`**: `left: 100%` on `.szc-header__sub-dropdown` (causes flyout to open in reverse).
2. **`sections/header.liquid:936`**: `padding: 6px 0 0 40px` on `.szc-mega-subcategories-list` (indents from the wrong side).
3. **`sections/header.liquid:1157`**: `left: 8px` on `.szc-showcase-badge` (places badge on wrong corner of product thumbnail).
4. **`snippets/product-card.liquid:520`**: `left: 10px` on `.szc-product-card__badges` (badge in wrong corner).
5. **`snippets/product-card.liquid:531`**: `right: 12px` on `.szc-product-card__actions` (wishlist button in wrong corner).
6. **`snippets/main-wishlist-content.liquid:504, 511`**: `left: 16px` on checkbox, `right: 16px` on remove button.
7. **`snippets/main-wishlist-content.liquid:438`**: `margin-left: auto !important` on list view actions.
8. **`sections/footer.liquid:564-586`**: `border-right: none; border-radius: 6px 0 0 6px` on input; `border-radius: 0 6px 6px 0` on button.
9. **`sections/newsletter.liquid:304-329`**: `border-right: none; border-radius: 6px 0 0 6px` on input; `border-radius: 0 6px 6px 0` on button.
10. **`assets/forms.css:85, 97`**: `right: var(--szc-space-4)` on `.szc-select-wrapper::after`; `padding-right: var(--szc-space-10)` on `.szc-select`.
11. **`sections/cart.liquid:998`**: `text-align: left;` enforced on mobile cart table cells.
12. **`sections/main-product.liquid:2402`**: `text-align: left;` on tab pane tables.
13. **`snippets/main-contact-content.liquid:692`**: `text-align: left;` on FAQ accordion titles.

---

## 11. JavaScript Directional Issues

The following JavaScript logic assumes LTR environments:

1. **`assets/slider.js:82-87`**:
   - `this.touchEndX < this.touchStartX - threshold` calls `this.next()`. In RTL, swiping left is backwards.
2. **`sections/recent-blog-posts.liquid:645, 821, 827`**:
   - `const targetX = -this.track.children[this.currentIndex].offsetLeft;`
   - `targetIndex = this.currentIndex + (diffX < 0 ? 1 : -1);`
   - In RTL, negative translateX translates the carousel in the wrong direction.
3. **`sections/main-product.liquid:3455, 3532, 4127`**:
   - `targetSlide.offsetLeft > 0 ? targetSlide.offsetLeft : ...`
   - `const scrollPos = sliderList.scrollLeft; const detectedIdx = Math.round(scrollPos / slideWidth);`
   - In modern browsers, `scrollLeft` is negative in RTL, causing `detectedIdx < 0`.
4. **`sections/explore-collections.liquid:1202, 1237, 1476`**:
   - Boundary checks and swipe drag math subtract `diffX` directly from `mouseStartScrollLeft`.
5. **`sections/main-collection.liquid:1597`**:
   - `track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';` pushes slides away from view in RTL.
6. **`sections/recently-viewed-products.liquid:444, 452`**:
   - `track.scrollBy({ left: -scrollAmount })` and `track.scrollBy({ left: scrollAmount })` scroll in the opposite direction of the mirrored SVG arrows.
7. **`sections/instagram-reels.liquid:1046`**:
   - `this.track.scrollLeft = scrollTarget` uses positive scalar offset to center the phone mockup.

---

## 12. Accessibility / Keyboard RTL Issues

1. **Keyboard Arrow Navigation**:
   - In `sections/recent-blog-posts.liquid:747-751`:
     ```javascript
     this.addEventListener('keydown', (e) => {
       if (e.key === 'ArrowLeft') {
         this.prev();
       } else if (e.key === 'ArrowRight') {
         this.next();
       }
     });
     ```
     In RTL, pressing `ArrowLeft` should advance forward (`next()`), and `ArrowRight` should move backward (`prev()`). Currently, keyboard navigation works backwards in RTL.
2. **Focus Trapping in Drawers (`assets/drawer.js:33`)**:
   - Calls `ShopziCurious.trapFocus(this, this.querySelector('.szc-drawer__inner'))`. The class `.szc-drawer__inner` is missing in several drawer components, which can cause keyboard focus trapping to fail.
3. **Screen Reader Announcement of Breadcrumbs & Sliders**:
   - Numbered pagination controls announce "Previous page" on the right button and "Next page" on the left button. The visual icon must match the announced semantic direction.

---

## 13. Mobile RTL Issues (320px, 375px, 390px, 430px)

1. **Mobile Navigation Drawer Slide Direction**:
   - Due to the `.szc-mobile-drawer__inner` class mismatch in `assets/rtl.css`, the drawer opens from the left on all mobile screens.
2. **Collection Filter Drawer Slide Direction**:
   - Due to `.szc-facets-drawer__inner` class mismatch, the mobile filter drawer opens from the left on all mobile screens.
3. **Mobile Sticky Add-To-Cart Bar (`sections/main-product.liquid:3182`)**:
   - On viewports <= 749px, `.szc-sticky-atc-bar__container` has `padding-left: 0 !important; padding-right: 0 !important;`. The product thumbnail appears on the right, and the Buy Now / Add to Cart action buttons appear on the left. Layout is compact and functional, with zero horizontal overflow.
4. **Mobile Gallery Horizontal Swiping**:
   - Thumbnail sync fails on 375px/390px iPhones due to negative `scrollLeft` values in Safari/WebKit.
5. **Horizontal Page Overflow Verification**:
   - Across 320px, 375px, 390px, and 430px viewports, all root wrappers enforce `overflow-x: hidden` in `assets/rtl.css:13-17`, preventing horizontal scrollbars on mobile devices in RTL mode.

---

## 14. Recommended Fix Order

Issues are grouped into technical priority phases for safe, non-breaking execution:

### Phase 1: Critical Document, Layout & Drawer Fixes
1. **RTL-001**: Sub-locale detection in `layout/theme.liquid` and `layout/password.liquid`.
2. **RTL-002**: Mobile navigation drawer class name fix in `assets/rtl.css` (`.szc-mobile-drawer__panel`).
3. **RTL-003**: Collection filter drawer class name fix in `assets/rtl.css` (`.szc-filter-drawer`).
4. **RTL-005**: Header Type 3 flyout submenu positioning (`left: auto; right: 100%`) and chevron reversal.

### Phase 2: High Priority Product, Wishlist & Search Component Fixes
5. **RTL-006**: Product card badges (`right: 10px`) and action buttons (`left: 12px`).
6. **RTL-007**: Wishlist card checkbox/remove buttons and list view actions.
7. **RTL-008**: Predictive search input margins (`margin-inline-*`), collection arrows, and View All link.

### Phase 3: High Priority Slider, Carousel & Animation JavaScript Math
8. **RTL-004**: Invert transform and swipe logic in `assets/slider.js`, `recent-blog-posts.liquid`, `main-product.liquid`, `explore-collections.liquid`, `main-collection.liquid`, and `recently-viewed-products.liquid`.
9. **RTL-010**: Countdown timer `direction: ltr` preservation.
10. **RTL-014**: Marquee keyframe animation direction flipping.

### Phase 4: Medium Priority Styling, Form & Directional Icon Polish
11. **RTL-009**: Newsletter form border-radius and border inversion in footer and newsletter section.
12. **RTL-011**: Select dropdown arrow positioning and padding inversion in `assets/forms.css`.
13. **RTL-012**: Phone number `unicode-bidi: isolate; direction: ltr;` in announcement bar.
14. **RTL-013**: Editorial canvas coordinate flipping in `sections/style-that-speaks.liquid`.
15. **RTL-015**: Directional SVG mirroring for pagination, mega menu view all, article back, and 404 shopping buttons.

---

## 15. Files With No RTL/LTR Issues

The following files and components were thoroughly inspected and determined to be directionally safe or inherently neutral:

- `layout/theme.liquid` (Base structure, CSS variable injection, skip-to-content)
- `assets/base.css` (CSS reset, box-sizing, typography base)
- `assets/variables.css` (Design tokens, color palettes, spacing variables)
- `assets/typography.css` (Font scales, line heights, letter spacing)
- `assets/animations.css` (Fade-in, scale, spin keyframes)
- `assets/responsive.css` (Grid breakpoints, container padding)
- `sections/hero-banner.liquid` (Classic slider fade/opacity mode)
- `sections/feature-icons-bar.liquid` (Flex layout with gap)
- `sections/bottom-usp-bar.liquid` (Grid layout with circular badge icons)
- `sections/category-cards.liquid` (Grid layout with center overlays)
- `snippets/card-collection.liquid` (Centered title and glassmorphism pill)
- `sections/brand-logos.liquid` (Static logo grid layout)
- `sections/sticky-story-showcase.liquid` (Dual-column desktop sticky scroll)
- `sections/age-verifier.liquid` (Centered modal dialog)
- `snippets/back-to-top.liquid` (Properly handled in `assets/rtl.css:193`)
- `snippets/quick-view-modal.liquid` (Properly handled in `assets/rtl.css:215-244`)
- `snippets/badge.liquid` (Pill badges, inline flex, text-based)
- `snippets/swatch.liquid` (Color swatches, square/circle pills, neutral)
- `snippets/quantity-input.liquid` (Preserved flex order in `assets/rtl.css:154`)
- `snippets/meta-tags.liquid` (Metadata and OpenGraph tags)
- `snippets/css-variables.liquid` (CSS variable mappings)
- `templates/*.json` (All 13 Shopify JSON templates)

---

## 16. Final Summary

- **Total RTL/LTR Issues Found**: **15**
  - **Critical Count**: 4 (`RTL-001` to `RTL-004`)
  - **High Count**: 4 (`RTL-005` to `RTL-008`)
  - **Medium Count**: 7 (`RTL-009` to `RTL-015`)
  - **Low Count**: 0
- **Features Requiring Fixes**: Sub-locale detection, Mobile Navigation Drawer, Collection Filter Drawer, Carousel/Slider JS Engines, Header Flyout Submenu, Product Card Overlays, Wishlist Card Controls, Predictive Search Drawer, Newsletter Form Radii, Countdown Timer, Select Inputs, Phone Bidi, Editorial Canvas, Marquee Animations, Navigation SVGs.
- **Features Already RTL/LTR Compatible**: Theme Check (0 offenses), Theme typography inheritance, Hero Banner fade slider, USP Bars, Category Cards, Brand Logos, Sticky Story Showcase desktop columns, Quick View modal, Back to Top button, Swatches, Badges, JSON templates.

---

### Complete List of Inspected Files (135 Files):

#### Layouts (2):
`layout/theme.liquid`, `layout/password.liquid`

#### CSS Assets (14):
`assets/animations.css`, `assets/base.css`, `assets/buttons.css`, `assets/cards.css`, `assets/components.css`, `assets/critical.css`, `assets/forms.css`, `assets/layout.css`, `assets/responsive.css`, `assets/rtl.css`, `assets/theme.css`, `assets/typography.css`, `assets/utilities.css`, `assets/variables.css`

#### JS Assets (12):
`assets/animations.js`, `assets/cart.js`, `assets/collection.js`, `assets/drawer.js`, `assets/global.js`, `assets/header.js`, `assets/helpers.js`, `assets/product.js`, `assets/search.js`, `assets/slider.js`, `assets/variant-picker.js`, `assets/wishlist.js`

#### Sections (46):
`sections/404.liquid`, `sections/age-verifier.liquid`, `sections/announcement-bar.liquid`, `sections/article.liquid`, `sections/blog.liquid`, `sections/bottom-usp-bar.liquid`, `sections/brand-features.liquid`, `sections/brand-logos.liquid`, `sections/cart.liquid`, `sections/category-cards.liquid`, `sections/collection.liquid`, `sections/collection-list.liquid`, `sections/collections.liquid`, `sections/countdown-timer.liquid`, `sections/custom-section.liquid`, `sections/diagonal-marquee.liquid`, `sections/explore-collections.liquid`, `sections/feature-icons-bar.liquid`, `sections/featured-collection.liquid`, `sections/footer.liquid`, `sections/header.liquid`, `sections/hero-banner.liquid`, `sections/instagram-gallery.liquid`, `sections/instagram-reels.liquid`, `sections/main-404.liquid`, `sections/main-about.liquid`, `sections/main-collection.liquid`, `sections/main-contact.liquid`, `sections/main-page.liquid`, `sections/main-product.liquid`, `sections/main-search.liquid`, `sections/main-wishlist.liquid`, `sections/newsletter.liquid`, `sections/page.liquid`, `sections/password.liquid`, `sections/popup.liquid`, `sections/predictive-search.liquid`, `sections/product.liquid`, `sections/product-recommendations.liquid`, `sections/promo-banner.liquid`, `sections/recent-blog-posts.liquid`, `sections/recently-viewed-products.liquid`, `sections/scroll-reveal-gallery.liquid`, `sections/search.liquid`, `sections/sticky-story-showcase.liquid`, `sections/style-that-speaks.liquid`

#### Snippets (32):
`snippets/accordion.liquid`, `snippets/age-verifier.liquid`, `snippets/article-card.liquid`, `snippets/back-to-top.liquid`, `snippets/badge.liquid`, `snippets/breadcrumbs.liquid`, `snippets/button.liquid`, `snippets/card-collection.liquid`, `snippets/cart-drawer.liquid`, `snippets/cart-item.liquid`, `snippets/country-selector.liquid`, `snippets/css-variables.liquid`, `snippets/facets.liquid`, `snippets/icon-button.liquid`, `snippets/icon.liquid`, `snippets/image.liquid`, `snippets/language-selector.liquid`, `snippets/main-about-content.liquid`, `snippets/main-contact-content.liquid`, `snippets/main-wishlist-content.liquid`, `snippets/mega-menu.liquid`, `snippets/meta-tags.liquid`, `snippets/mobile-drawer.liquid`, `snippets/pagination.liquid`, `snippets/predictive-search-modal.liquid`, `snippets/price.liquid`, `snippets/product-card.liquid`, `snippets/quantity-input.liquid`, `snippets/quick-view-modal.liquid`, `snippets/render-tab-content.liquid`, `snippets/swatch.liquid`, `snippets/trust-badges.liquid`

#### Templates (15):
`templates/404.json`, `templates/article.json`, `templates/blog.json`, `templates/cart.json`, `templates/collection.json`, `templates/gift_card.liquid`, `templates/index.json`, `templates/list-collections.json`, `templates/page.about.json`, `templates/page.contact.json`, `templates/page.json`, `templates/page.wishlist.json`, `templates/password.json`, `templates/product.json`, `templates/search.json`

#### Locales (14):
`locales/ar.json`, `locales/ar.schema.json`, `locales/de.json`, `locales/de.schema.json`, `locales/en.default.json`, `locales/en.default.schema.json`, `locales/es.json`, `locales/es.schema.json`, `locales/fr.json`, `locales/fr.schema.json`, `locales/he.json`, `locales/he.schema.json`, `locales/it.json`, `locales/it.schema.json`

