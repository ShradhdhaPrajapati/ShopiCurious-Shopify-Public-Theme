# ShopziCurious — RTL/LTR Phase 1 Implementation Report
**Critical Document, Drawer & Mega Menu Fixes**

- **Date**: September 19, 2026
- **Theme**: ShopziCurious (Shopify Public Theme)
- **Phase**: Phase 1 of 4 (Completed)
- **Theme Check Status**: `156 files inspected, 0 offenses detected`
- **Scope Compliance**: 100% isolated to Phase 1 (No carousel/slider JS modified; No unrelated features modified; 0 redesigns)

---

## 1. Executive Summary

Phase 1 of the RTL/LTR Compatibility Roadmap has been executed successfully. All critical document-level layout definitions, drawer selector mismatches, and multi-level flyout positioning issues have been resolved.

### Files Modified:
1. `layout/theme.liquid` — Sub-locale RTL detection and dynamic `rtl.css` injection.
2. `layout/password.liquid` — Password layout RTL detection, `dir` attribute, and `rtl.css` inclusion.
3. `assets/rtl.css` — Fixed real drawer selectors (`.szc-mobile-drawer__panel`, `.szc-filter-drawer`), removed obsolete classes, and added Type 3 submenu flyout rules.
4. `sections/header.liquid` — Added scoped RTL overrides for Type 3 nested submenu flyout and chevron mirroring.

---

## 2. Detailed Fixes Implemented

### 1. RTL-001 — Regional RTL Locale Detection (`layout/theme.liquid` & `layout/password.liquid`)
- **Problem**: Previously, `layout/theme.liquid` checked `request.locale.iso_code == 'ar'`. When a store used regional Shopify Markets sub-locales such as `ar-SA`, `ar-AE`, `ar-EG`, `he-IL`, `fa-IR`, or `ur-PK`, the condition evaluated to `false`. Consequently, `dir="ltr"` was rendered and `assets/rtl.css` was skipped.
- **Solution**:
  Extracted the two-letter language root before rendering the `<html>` element:
  ```liquid
  {%- liquid
    assign lang_iso = request.locale.iso_code | downcase | slice: 0, 2
    assign is_rtl = false
    if lang_iso == 'ar' or lang_iso == 'he' or lang_iso == 'fa' or lang_iso == 'ur'
      assign is_rtl = true
    endif
  -%}
  <!doctype html>
  <html class="no-js {% if request.design_mode %}shopify-design-mode{% endif %}" lang="{{ request.locale.iso_code }}" dir="{% if is_rtl %}rtl{% else %}ltr{% endif %}">
  ```
  And updated stylesheet loading:
  ```liquid
  {%- if is_rtl -%}
    {{ 'rtl.css' | asset_url | stylesheet_tag }}
  {%- endif -%}
  ```
- **Coverage**: Applied identically to both `layout/theme.liquid` and `layout/password.liquid`. Works seamlessly for all regional variants without hardcoding country codes.

---

### 2. RTL-002 — Mobile Navigation Drawer (`assets/rtl.css`)
- **Problem**: `assets/rtl.css` targeted the obsolete class `.szc-mobile-drawer__inner`. The actual drawer markup in `snippets/mobile-drawer.liquid:12` uses `.szc-mobile-drawer__panel`. Due to this mismatch, mobile menus on RTL pages slid in from the left.
- **Solution**:
  - Removed obsolete `.szc-mobile-drawer__inner` rules completely.
  - Targeted the actual `.szc-mobile-drawer__panel`:
    ```css
    html[dir="rtl"] .szc-mobile-drawer {
      left: auto !important;
      right: 0 !important;
    }

    html[dir="rtl"] .szc-mobile-drawer__panel {
      right: 0 !important;
      left: auto !important;
      transform: translateX(100%) !important;
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15) !important;
    }

    html[dir="rtl"] .szc-mobile-drawer.is-open .szc-mobile-drawer__panel {
      transform: translateX(0) !important;
    }

    html[dir="rtl"] .szc-mobile-drawer__sub-menu {
      padding: 8px 12px 16px 0 !important;
    }
    ```
- **Result**: In RTL, the drawer is anchored to the right, hidden at `translateX(100%)`, and animates smoothly to `translateX(0)` on open with leftward elevation shadow. LTR behavior remains completely untouched (`left: 0; transform: translateX(-100%)`).

---

### 3. RTL-003 — Collection Filter Drawer (`assets/rtl.css`)
- **Problem**: `assets/rtl.css` targeted obsolete selectors `.szc-facets-drawer` and `.szc-facets-drawer__inner`. The real markup in `sections/main-collection.liquid:468, 954` uses `.szc-filter-drawer`. In RTL, the filter drawer continued to slide out from the left.
- **Solution**:
  - Removed obsolete `.szc-facets-drawer` and `.szc-facets-drawer__inner` selectors.
  - Implemented RTL overrides on `.szc-filter-drawer`:
    ```css
    html[dir="rtl"] .szc-filter-drawer {
      right: 0 !important;
      left: auto !important;
      transform: translateX(100%) !important;
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12) !important;
    }

    html[dir="rtl"] .szc-filter-drawer.is-open {
      transform: translateX(0) !important;
    }
    ```
- **Result**: In RTL, clicking "Filters" slides the facet drawer out from the right edge with a left-facing shadow. In LTR, it continues to slide out from the left.

---

### 4. RTL-005 — Mega Menu Type 3 Nested Flyout Submenu (`sections/header.liquid` & `assets/rtl.css`)
- **Problem**: The multi-level dropdown submenu for Header Type 3 was hardcoded to `left: 100%` with `transform: translateX(6px)`. In RTL, this forced the third-level menu to fly out over parent items or off-screen to the right. Additionally, the flyout indicator chevron pointed to the right (`>`).
- **Solution**:
  - Added targeted RTL rules in `sections/header.liquid` and `assets/rtl.css`:
    ```css
    html[dir="rtl"] .szc-header__sub-chevron {
      margin-left: 0 !important;
      margin-right: auto !important;
      transform: scaleX(-1) !important;
    }

    html[dir="rtl"] .szc-header__dropdown-item:hover > .szc-header__dropdown-link .szc-header__sub-chevron {
      transform: scaleX(-1) translateX(2px) !important;
    }

    html[dir="rtl"] .szc-header__sub-dropdown {
      left: auto !important;
      right: 100% !important;
      transform: translateX(-6px) !important;
    }

    html[dir="rtl"] .szc-header__dropdown-item:hover > .szc-header__sub-dropdown,
    html[dir="rtl"] .szc-header__dropdown-item:focus-within > .szc-header__sub-dropdown,
    html[dir="rtl"] .szc-header__dropdown-item.is-expanded > .szc-header__sub-dropdown {
      transform: translateX(0) !important;
    }
    ```
- **Result**:
  - In RTL: Nested flyout submenus emerge from `right: 100%` and translate towards the left (`translateX(-6px)` to `0`). Chevrons point left (`<`) and nudge left on hover.
  - In LTR: Flyouts continue to open to the right (`left: 100%`) with chevrons pointing right (`>`).
  - Scoped strictly to Type 3 (`.szc-header__sub-dropdown` / `.szc-header__sub-chevron`) without affecting Type 1 (Image Left) or Type 2 (Products Right) mega menus.

---

## 3. Obsolete Selector Elimination

A global search across all theme assets, snippets, sections, and layouts confirms that the following obsolete selectors have been **completely eliminated**:
- `grep -rn ".szc-mobile-drawer__inner"` -> **0 matches**
- `grep -rn ".szc-facets-drawer"` -> **0 matches**

---

## 4. RTL & LTR Regression Verification

### Locale Logic Verification:
| Test Locale | Language Root | `is_rtl` | Document `dir` | `rtl.css` Loaded | Status |
|---|---|:---:|:---:|:---:|:---:|
| `en` | `en` | False | `dir="ltr"` | No | Passed |
| `en-US` | `en` | False | `dir="ltr"` | No | Passed |
| `fr` | `fr` | False | `dir="ltr"` | No | Passed |
| `fr-CA` | `fr` | False | `dir="ltr"` | No | Passed |
| `de` | `de` | False | `dir="ltr"` | No | Passed |
| `it` | `it` | False | `dir="ltr"` | No | Passed |
| `es` | `es` | False | `dir="ltr"` | No | Passed |
| `ar` | `ar` | True | `dir="rtl"` | Yes | Passed |
| **`ar-SA`** | `ar` | True | `dir="rtl"` | Yes | **Passed (Fixed)** |
| **`ar-AE`** | `ar` | True | `dir="rtl"` | Yes | **Passed (Fixed)** |
| **`ar-EG`** | `ar` | True | `dir="rtl"` | Yes | **Passed (Fixed)** |
| `he` | `he` | True | `dir="rtl"` | Yes | Passed |
| **`he-IL`** | `he` | True | `dir="rtl"` | Yes | **Passed (Fixed)** |
| `fa` | `fa` | True | `dir="rtl"` | Yes | Passed |
| **`fa-IR`** | `fa` | True | `dir="rtl"` | Yes | **Passed (Fixed)** |
| `ur` | `ur` | True | `dir="rtl"` | Yes | Passed |
| **`ur-PK`** | `ur` | True | `dir="rtl"` | Yes | **Passed (Fixed)** |

### Interactive Component Regression Verification:
1. **Desktop Header & Mega Menus**:
   - Mega Menu Type 1 (Image Left): Unaffected; preserves banner column and navigation columns.
   - Mega Menu Type 2 (Products Right): Unaffected; preserves left nav and product showcase.
   - Mega Menu Type 3 (Dropdown): Submenu flyout opens to right in LTR, opens to left in RTL.
2. **Mobile Drawer**:
   - LTR: Slides in from left (`translateX(-100%)` -> `translateX(0)`).
   - RTL: Slides in from right (`translateX(100%)` -> `translateX(0)`).
3. **Collection Filter Drawer**:
   - LTR: Anchored left, slides from left.
   - RTL: Anchored right, slides from right.
4. **Untouched Components**:
   - Zero modifications to carousel/slider JS files (`slider.js`, `explore-collections`, `recent-blog-posts`, `main-product`, `scroll-reveal-gallery`, `instagram-reels`).
   - Zero modifications to product cards, wishlist, predictive search, newsletter, or countdown timer.

---

## 5. Theme Check Validation

Command executed:
```bash
theme-check .
```

Result:
```text
156 files inspected, 0 offenses detected, 0 offenses auto-correctable
```

All JSON templates, config files, locales, and Liquid templates are syntactically valid and compliant with Shopify theme standards.

---

## 6. Remaining Issues Matrix (For Subsequent Phases)

The following 11 issues remain queued for upcoming phases as per the audit roadmap:

| Issue ID | Component | Description | Target Phase |
|---|---|---|:---:|
| **RTL-006** | Product Card | Badges (`left: 10px`) & actions (`right: 12px`) swap | **Phase 2** |
| **RTL-007** | Wishlist Card | Select checkbox, remove button & list view margins | **Phase 2** |
| **RTL-008** | Predictive Search | Input icon margins, close button, collection arrows | **Phase 2** |
| **RTL-004** | Sliders / Carousels | JavaScript coordinate math & swipe direction inversion | **Phase 3** |
| **RTL-010** | Countdown Timer | Enforce `direction: ltr` to preserve unit order | **Phase 3** |
| **RTL-014** | Marquees | Marquee CSS keyframe translation directions | **Phase 3** |
| **RTL-009** | Newsletter Forms | Input & button border-radius and border seams | **Phase 4** |
| **RTL-011** | Form Selects | Caret positioning & padding inversion | **Phase 4** |
| **RTL-012** | Announcement Bar | Phone number `unicode-bidi: isolate; direction: ltr;` | **Phase 4** |
| **RTL-013** | Style That Speaks | Asymmetrical editorial layout absolute coordinates | **Phase 4** |
| **RTL-015** | Directional SVGs | Pagination, mega menu view all, cart & 404 arrows | **Phase 4** |

---

### Phase 1 Complete — Awaiting Approval for Phase 2
Phase 1 fixes have been completely implemented and verified. No further changes will be made until explicit user approval.

