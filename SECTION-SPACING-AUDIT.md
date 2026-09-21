# ShopziCurious — Global Section Spacing Audit

**Scope:** audit only. No theme CSS, Liquid, JavaScript, schema, section order, or settings were changed.  
**Routes rendered:** `/` and `/ar`.  
**Viewport coverage:** 1440, 1280, 1024, 430, 390, 375, and 320px. The numeric matrix uses the representative rendered measurements at 1440px (desktop), 1024px (tablet), and 390px (mobile); the remaining widths were checked for breakpoint changes and overflow.

## Method

Measurements are browser-rendered pixel distances, not a single declared CSS property. “Visual gap” is measured from the last visible/painted content edge of Section A to the first visible/painted content edge of Section B. For sections that deliberately touch or overlap (marquees, full-bleed/sticky sections), the actual root-boundary relationship is shown instead:

- `0` = adjoining painted section boundaries
- `+` = blank root-boundary gap
- `−` = root-boundary overlap
- `—` = intentional full-bleed/background transition; an isolated content-edge figure would be misleading

LTR and RTL have the same computed vertical measurements at the checked widths. `/ar` rendered with `lang="ar"` and `dir="rtl"`; no vertical-spacing-only RTL divergence was found.

## Actual Homepage Order

`templates/index.json` enables 16 homepage content sections, in this order:

Hero Banner → Category Cards → Featured Collection → Diagonal Marquee → Promo Banner → Scroll Reveal Gallery → Explore Collections → Style That Speaks → Brand Features → Countdown Timer → Sticky Story Showcase → Instagram Gallery → Instagram Reels → Recent Blog Posts → Bottom USP Bar.

The disabled Feature Icons Bar is excluded. Announcement Bar, Header, and Footer come from section groups and are included below because they form adjacent rendered boundaries.

## Current Spacing Matrix

| # | Section A | Section B | Desktop | Tablet | Mobile | RTL | Status |
| -: | --- | --- | ---: | ---: | ---: | --- | --- |
| 1 | Announcement Bar | Header | 0px | 0px | 0px | Same | Intentional chrome adjacency |
| 2 | Header | Hero Banner | 0px | 0px | 0px | Same | Intentional chrome adjacency |
| 3 | Hero Banner | Category Cards | 56px | 56px | 36px | Same | Intentionally different (hero transition) |
| 4 | Category Cards | Featured Collection | 86px | 86px | 110px | Same | Clearly inconsistent |
| 5 | Featured Collection | Diagonal Marquee | +24px | +24px | +24px | Same | Slightly inconsistent; explicit root gap |
| 6 | Diagonal Marquee | Promo Banner | −24px | −24px | −24px | Same | Intentionally different (overlap) |
| 7 | Promo Banner | Scroll Reveal Gallery | 56px | 56px | 84px | Same | Clearly inconsistent on mobile |
| 8 | Scroll Reveal Gallery | Explore Collections | 86px | 86px | 70px | Same | Slightly inconsistent; gallery is full-bleed |
| 9 | Explore Collections | Style That Speaks | 206px | 181px | 102px | Same | Clearly inconsistent; compounded section-specific envelopes |
| 10 | Style That Speaks | Brand Features | 0px | 0px | 0px | Same | Intentionally different (marquee/background transition) |
| 11 | Brand Features | Countdown Timer | 48px | 48px | 48px | Same | Consistent |
| 12 | Countdown Timer | Sticky Story Showcase | 129px | 144px | 86px | Same | Intentionally different but overly variable |
| 13 | Sticky Story Showcase | Instagram Gallery | 137px | 153px | 79px | Same | Clearly inconsistent |
| 14 | Instagram Gallery | Instagram Reels | 128px | 128px | 90px | Same | Clearly inconsistent |
| 15 | Instagram Reels | Recent Blog Posts | 183px | 184px | 142px | Same | Clearly inconsistent |
| 16 | Recent Blog Posts | Bottom USP Bar | 121px | 121px | 109px | Same | Clearly inconsistent |
| 17 | Bottom USP Bar | Footer | 65px | 65px | 106px | Same | Slightly inconsistent; footer content starts below its own top padding |

Notes:

- The 24px Featured Collection → Marquee gap comes from the next root's placement; the Marquee → Promo root boxes deliberately overlap by 24px. Those two rows must be treated as one compositional transition, not normalized independently.
- Scroll Reveal and Sticky Story sections use full-bleed/sticky visual structures. Their measured content edges are valid rendered values, but their root boundaries remain adjoining (`0px`); the design decision is whether their generous internal envelopes should be preserved.
- At 390px, the responsive values are not a simple uniform scale: Explore is `42px`, Style That Speaks is `36px`, Brands is `28.8px`, Instagram Gallery is `39.2px`, and Reels is `50.4px/56px`. This is the source of the uneven mobile rhythm.

## Rendered Section Padding / Boundary Evidence

The following computed root envelopes explain the matrix. Values are top/bottom padding at 1440px / 1024px / 390px respectively.

| Section | Desktop | Tablet | Mobile | Observed source |
| --- | --- | --- | --- | --- |
| Hero Banner | 0 / 0 | 0 / 0 | 0 / 0 | Full-height, full-bleed hero |
| Category Cards | 32 / 32 | 32 / 32 | 32 / 32 | `--szc-space-12` resolves to 32px |
| Featured Collection | 32 / 32 | 32 / 32 | 32 / 32 | `--szc-space-12` plus box-hover offsets |
| Diagonal Marquee | 0 / 0 | 0 / 0 | 0 / 0 | Custom zero padding; 24px overlap relationship |
| Promo Banner | 32 / 32 | 32 / 32 | 32 / 32 | `--szc-space-12`, then mobile `--szc-space-8` |
| Scroll Reveal Gallery | 0 / 0 | 0 / 0 | 0 / 0 | Settings are zero |
| Explore Collections | 56 / 56 | 56 / 56 | 42 / 42 | Section custom vars, mobile `× .75` |
| Style That Speaks | 48 / 48 | 48 / 48 | 36 / 36 | Section custom vars |
| Brand Features | 36 / 36 | 36 / 36 | 28.8 / 28.8 | Section custom vars, mobile `× .8` |
| Countdown Timer | 48 / 48 | 48 / 48 | 48 / 48 | Section custom vars; no mobile reduction |
| Sticky Story Showcase | 0 / 0 | 0 / 0 | 32 / 40 | Zero desktop settings; mobile component override |
| Instagram Gallery | 56 / 56 | 56 / 56 | 39.2 / 39.2 | Section custom vars, mobile `× .7` |
| Instagram Reels | 72 / 80 | 72 / 80 | 50.4 / 56 | Section custom vars, mobile `× .7` |
| Recent Blog Posts | 48 / 56 | 48 / 56 | 36 / 44 | Hard-coded section CSS |
| Bottom USP Bar | 24 / 24 + 32px top margin | same | same | Global token + explicit top margin |
| Footer | 32 / 0 | 32 / 0 | 32 / 0 | Footer-specific CSS |

## Existing Spacing Architecture

The theme already contains a foundation worth reusing:

- `assets/variables.css` defines `--szc-space-0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32`, plus `--szc-section-spacing-desktop: 80px` and `--szc-section-spacing-mobile: 48px`.
- `assets/layout.css` provides `.szc-section-padding`, using the 48px mobile / 80px desktop section tokens.
- `assets/responsive.css` adjusts `.szc-section-padding` to 75% of the desktop token between 768px and 991px.
- `snippets/css-variables.liquid` exposes the merchant setting `section_spacing_desktop` and grid/container tokens.
- `config/settings_schema.json` and `config/settings_data.json` currently set `section_spacing_desktop` to 80px.

However, the homepage does **not** consistently consume `.szc-section-padding`. It has at least four separate systems: global `--szc-space-*`, global section tokens, per-section custom variables, and hard-coded values.

### Current values in active homepage spacing

`0, 24, 28.8, 32, 36, 39.2, 40, 42, 44, 48, 50.4, 56, 72, 80px`, plus compound margins/overlaps of `-24, +24, +32px`.

### Token defect to preserve for the implementation discussion

`assets/variables.css` declares `--szc-space-12: 2rem; /* 48px */`. `2rem` resolves to **32px** at the current root font size, while the comment and many fallback values describe it as 48px. Category Cards, Featured Collection, and Promo Banner therefore currently render 32px where their fallback/documentation implies 48px. This must be deliberately resolved during an approved implementation; it should not be silently changed as part of this audit.

## Inconsistencies and Likely Source Files

| Gap(s) | Why it is inconsistent | Likely source files | Centralized direction (not implemented) |
| --- | --- | --- | --- |
| Category → Featured; Promo → Scroll | 32px envelopes combine with separate heading/card structures and diverge further on mobile. | `sections/category-cards.liquid`, `sections/featured-collection.liquid`, `sections/promo-banner.liquid`, `assets/variables.css` | Map ordinary content sections to one standard section envelope. |
| Featured → Marquee → Promo | Explicit `+24/-24` pair; not a normal section gap. | `sections/featured-collection.liquid`, `sections/diagonal-marquee.liquid`, `sections/promo-banner.liquid` | Keep as a named compositional exception. |
| Scroll → Explore; Explore → Style | 0/56px, then 56/48px envelopes compound into 86–206px visual separations. | `sections/scroll-reveal-gallery.liquid`, `sections/explore-collections.liquid`, `sections/style-that-speaks.liquid` | Define adjacent section roles instead of adding pair-specific margins. |
| Countdown → Sticky; Sticky → Instagram | Full-bleed/sticky structures have large, unrelated visual envelopes. | `sections/countdown-timer.liquid`, `sections/sticky-story-showcase.liquid`, `sections/instagram-gallery.liquid` | Keep sticky/full-bleed behavior, normalize only their external section rhythm. |
| Instagram → Reels → Blog → USP → Footer | Independent 56/72/80/48/56/32 values and USP top margin produce 90–183px visual gaps. | `sections/instagram-gallery.liquid`, `sections/instagram-reels.liquid`, `sections/recent-blog-posts.liquid`, `sections/bottom-usp-bar.liquid`, `sections/footer.liquid` | Apply standard/large/compact external spacing roles and preserve inner carousel spacing. |
| Mobile across most content sections | Different reduction factors (`.7`, `.75`, `.8`, none) are used by unrelated sections. | The section files above plus `assets/responsive.css` | Use a single responsive token scale, with documented exceptions only. |

## Recommended Global Spacing System (Proposal Only)

This premium fashion storefront has large photography-led modules and should not force one gap everywhere. A small role-based scale is sufficient:

| Role | Desktop | Tablet | Mobile | Intended use |
| --- | ---: | ---: | ---: | --- |
| Compact | 32px | 28px | 24px | Marquee/USP/footer adjacency, dense supporting modules |
| Standard | 56px | 48px | 36px | Normal content-section rhythm |
| Large | 80px | 64px | 48px | Editorial transitions around high-impact visual modules |
| Flush / overlap | 0px / documented overlap | same | same | Hero, full-bleed media, and the Marquee → Promo composition only |

Why this fits: 56px is already present in Explore/Instagram and reads premium without becoming sparse; 80px preserves editorial breathing room for hero and large visual transitions; 36px keeps the 320–430px layout intentional; and 24/32px avoids an oversized gap before the footer/USP. These values should become semantic custom properties (for example, `--szc-section-gap-standard`) rather than a new margin declaration in every section.

## Implementation Scope (For Approval)

- **Sections inspected:** 16 enabled homepage content sections, plus Announcement Bar, Header, and Footer.
- **Adjacent gaps inspected:** 17.
- **Clearly/slightly inconsistent gaps:** 10 normal-content transitions; 3 deliberately special transitions to retain/document.
- **Existing reusable architecture:** `assets/variables.css`, `assets/layout.css`, `assets/responsive.css`, and `snippets/css-variables.liquid`.
- **Likely files requiring change:** 13 section files plus 3 central architecture files; the exact final count can fall if wrapper-level rules replace section-specific declarations cleanly.
- **New settings required:** none initially. Add semantic desktop/mobile variables in the existing token system; do not add merchant controls unless the later approved design requires them.
- **Intentional exceptions:** Header → Hero, Hero → first content, Featured → Marquee → Promo, Scroll Reveal, Sticky Story, and full-bleed background transitions.
- **Estimated change shape:** 3 central token/layout changes and roughly 10–13 small section class/variable substitutions; no JavaScript or schema changes expected.
- **Complexity:** **MEDIUM**. The centralization is straightforward, but it must preserve carousel, sticky, overlap, and full-bleed visual behavior across LTR/RTL and all responsive breakpoints.

## Verification

`/usr/local/bin/theme-check .` completed successfully: **156 files inspected, 0 offenses detected**.

## Audit Completion

**No code was modified.** This report adds documentation only. No Phase C work or spacing implementation has started.
