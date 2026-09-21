# ShopziCurious — Final LTR/RTL browser QA

Date: 2026-09-19  
Preview routes: `http://127.0.0.1:9292/` and `http://127.0.0.1:9292/ar`

## Results

| Area | Result | Evidence |
| --- | --- | --- |
| Desktop LTR | Pass | Rendered at 1440px; header, hero, localization, search, cart drawer and mega menu initialized. No document horizontal overflow; 18 homepage sections rendered. |
| Desktop RTL | Pass | Rendered at 1440px with `lang="ar"` and `dir="rtl"`; header ordering, mobile-drawer off-canvas side and cart/search behavior mirrored. No document horizontal overflow; 18 homepage sections rendered. |
| Mobile LTR | Pass | Rendered screenshots at 320px, 375px, 390px and 430px. At 320px and 390px, computed horizontal overflow was `0px`; search, cart drawer and main-navigation drawer opened. |
| Mobile RTL | Pass | Rendered screenshots at 320px, 375px, 390px and 430px. At 320px and 390px, computed horizontal overflow was `0px`; search, cart drawer and main-navigation drawer opened from the mirrored side. |
| RTL semantics | Pass | Arabic route returns `lang="ar" dir="rtl"`; Arabic localized menu, search, account/cart, product and country labels render in the browser. Off-canvas mobile panels are positioned to the opposite side from LTR. |
| Search / predictive search | Pass | Search trigger opens the search component and moves focus to its input in both directions. |
| Cart drawer | Pass | Cart trigger opens `.szc-cart-drawer.is-open` in both directions. |
| Mega menu | Pass | Desktop Women/النساء menu trigger opens its mega-menu container in both directions. |
| Mobile navigation | Pass | Main Navigation trigger opens `.szc-mobile-drawer.is-open` at 390px in both directions. |

The rendered first-fold screenshots confirm the desktop header/hero and the 320px/430px LTR/RTL responsive header/hero layouts. The cookie-consent banner was supplied by Shopify and initially covered part of the first fold; it is not theme markup and did not prevent custom-element initialization or the scripted interaction checks.

## Runtime and network

- Theme JavaScript: no uncaught theme exception, failed custom-element initialization, ResizeObserver warning, animation loop failure, or scroll failure was observed during load and interaction checks.
- Theme assets: after the fix below, the page provides an explicit favicon asset URL. No failed Liquid-generated theme asset was observed.
- Preview-only external diagnostics: Chrome recorded an `origin_trials` CORS/`ERR_FAILED` message from Shopify's injected storefront script and a Shop Pay iframe `403`/frame-ancestor policy message. These originate outside the theme (`cdn.shopify.com` and `shop.app`) and do not affect the theme's own scripts or page rendering.

## Liquid and Theme Check

- `/`: `0` occurrences of `Liquid error`.
- `/ar`: `0` occurrences of `Liquid error`.
- `/usr/local/bin/theme-check .`: `156 files inspected, 0 offenses detected`.

## Issue found and minimal fix

| Issue | Reproduction | Root cause | Fix | Re-test |
| --- | --- | --- | --- | --- |
| Browser requested `/favicon.ico` with a 404. | Load the local preview with no configured merchant favicon. | `settings.favicon` is blank, so the layout emitted no favicon link and Chrome made its default request. | Added a fallback `icon-cart.svg` favicon link only when `settings.favicon` is blank in `layout/theme.liquid`. | The rendered preview now emits `/cdn/shop/t/8/assets/icon-cart.svg…`; Theme Check passes. |

No section redesigns, refactors, or Phase C work were performed.

## Remaining issues

None in theme-owned code found in this QA pass. The two external Shopify/Shop Pay console diagnostics above should only be investigated if they reproduce on the production storefront outside the local development proxy.

## Final status

**READY FOR NEXT PHASE**
