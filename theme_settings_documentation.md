# ShopziCurious Theme Settings - Complete Merchant & Developer Guide

This document provides a comprehensive breakdown of all **17 Theme Setting Categories** configured in `config/settings_schema.json` and connected across Liquid templates, CSS custom variables, and JavaScript modules in the **ShopziCurious** theme.

---

## Overview & Architecture

- **Theme Editor Integration**: All settings are configured under **Online Store > Customize > Theme Settings**.
- **CSS Variable Injection**: System & custom colors, typography scales, spacing tokens, and border radii are dynamically declared in `snippets/css-variables.liquid` and rendered in `:root`.
- **JS Configuration**: Global runtime flags (`cartType`, `enablePredictiveSearch`, `enableAnimations`, `enableFreeShippingBar`, `freeShippingThreshold`, `enableWishlist`) are passed to `window.ShopziCurious.settings` in `layout/theme.liquid`.

---

## 📜 Complete 17 Theme Settings Breakdown

### 1. 🎨 Branding (`settings_schema.json` -> "Branding")
- **`logo`** (`image_picker`): Primary store logo image used in header and navigation.
- **`logo_width`** (`range`, 50px - 300px): Custom width adjustment for desktop header logo.
- **`logo_mobile`** (`image_picker`): Optional separate logo optimized for mobile screens (under 768px).
- **`favicon`** (`image_picker`): Store browser tab icon (supports 32x32px PNG/ICO).

### 2. 🌈 Colors (`settings_schema.json` -> "Colors")
- **`color_primary`** (`color`, default `#111111`): Primary dark tone for buttons, headers, and key elements.
- **`color_secondary`** (`color`, default `#D4A373`): Warm gold/camel accent for luxury highlights & active states.
- **`color_accent`** (`color`, default `#E76F51`): Dynamic accent tone for sale badges and promotional Call-To-Actions.
- **`color_background`** (`color`, default `#FFFFFF`): Main page background color.
- **`color_surface`** (`color`, default `#F8F9FA`): Subtle gray surface background for cards & sections.
- **`color_border`** (`color`, default `#E5E5E5`): Divider lines, card borders, and input outlines.
- **`color_heading`** (`color`, default `#111111`): Typography color for `<h1>` - `<h6>` headers.
- **`color_text_primary`** (`color`, default `#2B2B2B`): Primary body copy text color.
- **`color_text_muted`** (`color`, default `#757575`): Secondary subtitle & metadata text color.
- **`color_success`** / **`color_warning`** / **`color_error`** (`color`): Toast notification & form feedback colors.
- **`color_overlay`** (`color`, default `#000000`): Background backdrop dimming color for drawers & modals.

### 3. ✍️ Typography (`settings_schema.json` -> "Typography")
- **`type_heading_font`** (`font_picker`): Custom font family for headings.
- **`type_primary_font`** (`font_picker`): Custom font family for body text & product descriptions.
- **`type_nav_font`** (`font_picker`): Custom font family for navigation menus & collection links.
- **`base_font_size`** (`range`, 14px - 18px): Global rem/px scale for text readability.
- **`heading_scale`** (`range`, 85% - 130%): Proportionate multiplier for heading hierarchy sizing.

### 4. 📐 Layout & Spacing (`settings_schema.json` -> "Layout")
- **`max_page_width`** (`select`: 1200px, 1280px, 1440px, 1600px): Maximum page container width limit.
- **`min_page_margin`** (`range`, 12px - 32px): Left/right gutters for screen edge spacing.
- **`section_spacing_desktop`** (`range`, 40px - 120px): Vertical margin between homepage sections.
- **`grid_gap`** (`range`, 12px - 48px): Grid gap spacing between product cards.
- **`card_corner_radius`** (`range`, 0px - 24px): Corner rounding for product/blog cards (`--szc-radius-card`).
- **`button_corner_radius`** (`range`, 0px - 40px): Corner rounding for primary & secondary buttons (`--szc-radius-button`).
- **`input_corner_radius`** (`range`, 0px - 20px): Corner rounding for text fields & select boxes (`--style-border-radius-inputs`).

### 5. 🔘 Buttons (`settings_schema.json` -> "Buttons")
- **`primary_button_style`** (`select`: Solid, Accent, Outline): Aesthetic theme default for primary actions.
- **`button_hover_effect`** (`select`: Subtle Lift, Color Shift, None): Hover animation behavior for CTAs.
- **`button_height`** (`select`: 40px Compact, 48px Standard, 56px Large): Target touch height for buttons.

### 6. 🎴 Cards (`settings_schema.json` -> "Cards")
- **`card_style`** (`select`: Flat Minimalist, Bordered, Shadow Elevation): Visual container styling.
- **`card_hover_effect`** (`select`: Image Zoom, Card Lift, None): Interactive hover states for product grid cards.

### 7. 🛍️ Product Card (`settings_schema.json` -> "Product Card")
- **`product_card_image_ratio`** (`select`: Portrait 3:4, Fashion 2:3, Square 1:1, Natural): Aspect ratio standard across collection grids.
- **`show_secondary_image`** (`checkbox`): Show 2nd product media image on mouse hover.
- **`enable_color_swatches`** (`checkbox`): Display clickable color variant dots on cards.
- **`enable_size_swatches`** (`checkbox`): Display available size pills directly on cards.
- **`enable_quick_shop`** (`checkbox`): Show Quick View modal button on product cards.
- **`enable_wishlist_button`** (`checkbox`): Show heart wishlist button on product cards.
- **`show_new_arrival_badge`** / **`show_bestseller_badge`** / **`show_limited_badge`** / **`show_sale_badge`** (`checkbox`): Control badge overlays.

### 8. 🗂️ Collection Page (`settings_schema.json` -> "Collection Page")
- **`collection_desktop_columns`** (`range`, 2 - 5): Grid column count on desktop viewports.
- **`collection_mobile_columns`** (`select`: 1 or 2): Mobile grid layout columns.
- **`products_per_page`** (`range`, 8 - 48): Pagination product limit per page.
- **`enable_lookbook_mode`** (`checkbox`): Enable edge-to-edge fashion editorial layout.
- **`enable_filtering`** / **`enable_sorting`** (`checkbox`): Enable/disable shop filters & sorting dropdowns.

### 9. 📱 Product Page (`settings_schema.json` -> "Product Page")
- **`enable_sticky_add_to_cart`** (`checkbox`): Toggle floating bottom Buy Now / Add to Bag bar when scrolling.
- **`gallery_layout`** (`select`: Stacked, Vertical Thumbnails, 2-Column Grid): Media gallery arrangement.
- **`enable_size_guide`** (`checkbox`): Enable size guide modal trigger link.
- **`show_model_info`** / **`show_fabric_info`** / **`show_care_instructions`** / **`show_fit_info`** (`checkbox`): Toggle product detail tabs & meta accordions.
- **`trust_badge_1_...`**, **`trust_badge_2_...`**, **`trust_badge_3_...`**: Customize icon, title, and subtitle subtext for product page trust callouts.

### 10. 🛒 Cart (`settings_schema.json` -> "Cart")
- **`cart_type`** (`select`: Slide-out Drawer or Page): Store cart presentation mode.
- **`enable_free_shipping_bar`** (`checkbox`): Enable top free shipping goal progress bar.
- **`free_shipping_threshold`** (`range`, $25 - $300): Target monetary threshold for free shipping.
- **`enable_cart_notes`** (`checkbox`): Enable order special instructions textarea in cart drawer.

### 11. 🔍 Search (`settings_schema.json` -> "Search")
- **`enable_predictive_search`** (`checkbox`): Enable real-time AJAX instant search popover.
- **`search_trending_keywords`** (`text`): Comma-separated list of default trending search terms (e.g. "Dresses, Jackets, Denim, Linen, Coats").

### 12. 📰 Blog / Editorial (`settings_schema.json` -> "Blog")
- **`show_article_author`** (`checkbox`): Display author name on blog posts.
- **`show_article_date`** (`checkbox`): Display publication date on blog posts.
- **`show_reading_time`** (`checkbox`): Automatically calculate and display estimated reading time (e.g. "4 min read").

### 13. ⚓ Footer (`settings_schema.json` -> "Footer")
- **`show_footer_newsletter`** (`checkbox`): Display newsletter subscription box in footer.
- **`show_social_icons`** (`checkbox`): Display social media channels.
- **`show_payment_icons`** (`checkbox`): Display payment badges bar.
- **`copyright_text`** (`text`): Custom copyright text output in footer bottom bar.

### 14. ⚡ Performance (`settings_schema.json` -> "Performance")
- **`enable_lazy_loading`** (`checkbox`): Enable native `loading="lazy"` on all theme images.
- **`enable_animations`** (`checkbox`): Enable smooth scroll entrance animations (`data-animate`).

### 15. ♿ Accessibility (`settings_schema.json` -> "Accessibility")
- **`accessibility_focus_ring`** (`checkbox`): High-contrast focus outline for keyboard navigation.
- **`respect_reduced_motion`** (`checkbox`): Automatically disable animations when operating system "Reduced Motion" is preferred.

### 16. ❤️ Wishlist (`settings_schema.json` -> "Wishlist")
- **`enable_wishlist`** (`checkbox`): Global wishlist feature toggle.
- **`wishlist_page_url`** (`url`): Custom page route for merchant's wishlist page.
- **`wishlist_empty_title`** / **`wishlist_empty_text`** (`text`): Empty state messaging.

### 17. 🛠️ Advanced (`settings_schema.json` -> "Advanced")
- **`custom_css`** (`html`): Raw CSS injection block rendered in `<head>` via `<style id="ShopziCuriousCustomCSS">`.
- **`tracking_head_code`** (`html`): Custom tracking pixels/analytics scripts injected in `<head>` prior to `</head>`.

---

## 🛠️ Summary of Implementation Changes

1. **`layout/theme.liquid`**:
   - Injected `settings.custom_css` and `settings.tracking_head_code`.
   - Populated `window.ShopziCurious.settings` object with runtime settings (`cartType`, `enablePredictiveSearch`, `enableAnimations`, `enableFreeShippingBar`, `freeShippingThreshold`, `enableWishlist`).
2. **`snippets/css-variables.liquid`**:
   - Connected all color palette variables, typography fonts, base size, heading scale, grid gap, section desktop spacing, button/card corner radii, and accessibility focus/motion CSS overrides.
3. **`sections/header.liquid`**:
   - Added `settings.logo`, `settings.logo_width`, and `settings.logo_mobile` fallbacks.
4. **`snippets/product-card.liquid`**:
   - Mapped card image ratios, secondary image hover, sale/new/bestseller/limited badges, quick shop trigger, and wishlist heart buttons directly to `settings_schema.json` keys.
5. **`sections/main-product.liquid`**:
   - Wrapped Sticky Add to Cart bar with `settings.enable_sticky_add_to_cart`.
6. **`snippets/cart-drawer.liquid`**:
   - Fixed free shipping threshold calculation (`settings.free_shipping_threshold * 100` cents) and connected `settings.enable_free_shipping_bar` & `settings.enable_cart_notes`.
7. **`snippets/predictive-search-modal.liquid`**:
   - Mapped initial state suggestions to `settings.search_trending_keywords`.
8. **`sections/article.liquid`**:
   - Mapped author, date, and calculated reading time to `settings.show_article_author`, `settings.show_article_date`, and `settings.show_reading_time`.
9. **`snippets/image.liquid`**:
   - Respected `settings.enable_lazy_loading` (falling back to `eager` when set to `false`).

---

## 🔍 Validation Status
- **`shopify theme check`**: **0 ERRORS** across all 88 theme files.
