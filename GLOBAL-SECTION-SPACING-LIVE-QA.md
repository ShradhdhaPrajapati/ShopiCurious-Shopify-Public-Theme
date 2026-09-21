# ShopziCurious — Live Global Section Spacing QA

**Mode:** AUDIT & LIVE VISUAL QA ONLY (No code modified)  
**Target Global Spacing System:**  
- **Desktop (≥ 992px):** `100px`  
- **Tablet (768px – 991px):** `80px`  
- **Mobile (< 768px):** `48px`  
**Storefront Routes:** `/` (LTR) and `/ar` (RTL) across Desktop (1440, 1280, 1024px), Tablet (991, 900, 768px), and Mobile (430, 390, 375, 320px).  
**Measurement Standard:** Rendered visual distance from the **LAST visible/painted content edge of Section A** to the **FIRST visible/painted content edge of Section B**.

---

## Remaining Issues (The 4 Problem Areas)

### Issue 1
- **Section A:** Explore Collections (`sections/explore-collections.liquid`)
- **Section B:** Style That Speaks (`sections/style-that-speaks.liquid`)
- **Desktop actual visual gap:** `~160px – 170px`
- **Tablet actual visual gap:** `~135px`
- **Mobile actual visual gap:** `~72px`
- **Expected:** `100px` (Desktop) / `80px` (Tablet) / `48px` (Mobile)
- **Difference:** `+60px to +70px` extra whitespace on desktop
- **Root cause:** Extra internal element envelope inside `Style That Speaks`. The canvas (`.szc-sts__canvas`) has `min-height: 860px` and positions its first child (`.szc-sts__heading-group`) at `top: 13.5%` (~116px down) and `.szc-sts__main-visual` at `top: 7%` (~60px down), creating 60px–116px of unpainted empty canvas space at the top of the section. This compounds with the 50px top padding of Style That Speaks and the 50px bottom padding of Explore Collections.
- **File:** `sections/style-that-speaks.liquid`
- **Selector:** `.szc-sts__canvas`, `.szc-sts__heading-group` (`top: 13.5%`), `.szc-sts__main-visual` (`top: 7%`)

---

### Issue 2
- **Section A:** Countdown Timer (`sections/countdown-timer.liquid`)
- **Section B:** Sticky Story Showcase (`sections/sticky-story-showcase.liquid`)
- **Desktop actual visual gap:** `~180px – 210px`
- **Tablet actual visual gap:** `~140px`
- **Mobile actual visual gap:** `~64px`
- **Expected:** `100px` (Desktop) / `80px` (Tablet) / `48px` (Mobile)
- **Difference:** `+80px to +110px` extra whitespace on desktop
- **Root cause:** In `Sticky Story Showcase`, `.szc-sss__sticky-viewport` has `height: 100vh; display: flex; align-items: center;`. In a typical desktop browser viewport (900px–1080px), vertically centering the ~580px tall content stage creates ~100px–160px of dead transparent headroom above the cards. This compounds on top of the section's 50px top padding and Countdown Timer's 50px bottom padding.
- **File:** `sections/sticky-story-showcase.liquid`
- **Selector:** `.szc-sss__sticky-viewport` (`height: 100vh; display: flex; align-items: center;`)

---

### Issue 3
- **Section A:** Sticky Story Showcase (`sections/sticky-story-showcase.liquid`)
- **Section B:** Instagram Gallery (`sections/instagram-gallery.liquid`)
- **Desktop actual visual gap:** `~190px – 220px`
- **Tablet actual visual gap:** `~145px`
- **Mobile actual visual gap:** `~64px`
- **Expected:** `100px` (Desktop) / `80px` (Tablet) / `48px` (Mobile)
- **Difference:** `+90px to +120px` extra whitespace on desktop
- **Root cause:** The exact same vertical centering in `.szc-sss__sticky-viewport`. Vertically centering the ~580px content inside a 100vh viewport creates ~100px–160px of dead space below the story cards before the sticky track completes scrolling and unpins, which compounds with the 50px bottom padding of Sticky Story and 50px top padding of Instagram Gallery.
- **File:** `sections/sticky-story-showcase.liquid`
- **Selector:** `.szc-sss__sticky-viewport` (`height: 100vh; align-items: center;`), `.szc-sticky-story-showcase`

---

### Issue 4
- **Section A:** Instagram Reels (`sections/instagram-reels.liquid`)
- **Section B:** Recent Blog Posts (`sections/recent-blog-posts.liquid`)
- **Desktop actual visual gap:** `~135px – 145px`
- **Tablet actual visual gap:** `~110px`
- **Mobile actual visual gap:** `~68px`
- **Expected:** `100px` (Desktop) / `80px` (Tablet) / `48px` (Mobile)
- **Difference:** `+35px to +45px` extra whitespace on desktop
- **Root cause:** In `Instagram Reels`, the showcase container `.szc-instagram-reels__showcase` has an internal bottom padding `padding-bottom: calc(var(--szc-ir-stagger, 20px) * 1.2);` (24px) to accommodate card stagger transforms, plus the center phone mockup has a prominent drop-shadow. This internal rail padding adds 24px of whitespace on top of the 50px bottom padding of Reels and 50px top padding of Recent Blog Posts.
- **File:** `sections/instagram-reels.liquid`
- **Selector:** `.szc-instagram-reels__showcase` (`padding-bottom: calc(var(--szc-ir-stagger, 20px) * 1.2);`)

---

## Final Transition Matrix (All Homepage Sections)

| Section A | Section B | Desktop Actual | Tablet Actual | Mobile Actual | Status | Notes |
|---|---|---:|---:|---:|:---:|---|
| **Announcement Bar** | **Header** | 0px | 0px | 0px | **PASS** | Intentional chrome adjacency |
| **Header** | **Hero Banner** | 0px | 0px | 0px | **PASS** | Intentional chrome adjacency |
| **Hero Banner** | **Category Cards** | 100px | 80px | 48px | **PASS** | `.szc-section-rhythm--hero-follow` provides exact global gap |
| **Category Cards** | **Featured Collection** | 100px | 80px | 48px | **PASS** | Clean 50px + 50px transition |
| **Featured Collection** | **Diagonal Marquee** | +24px | +24px | +24px | **PASS** | Intentional marquee placement preserved |
| **Diagonal Marquee** | **Promo Banner** | −24px | −24px | −24px | **PASS** | Intentional marquee overlap preserved |
| **Promo Banner** | **Scroll Reveal Gallery** | 100px | 80px | 48px | **PASS** | Clean transition to scroll reveal stage |
| **Scroll Reveal Gallery** | **Explore Collections** | 100px | 80px | 48px | **PASS** | Clean transition to explore collections header |
| **Explore Collections** | **Style That Speaks** | ~165px | ~135px | ~72px | **ISSUE** | Extra top offset in `.szc-sts__canvas` (Issue 1) |
| **Style That Speaks** | **Brand Features** | 0px | 0px | 0px | **PASS** | Intentional flush white background transition preserved |
| **Brand Features** | **Countdown Timer** | 100px | 80px | 48px | **PASS** | Clean 50px + 50px transition |
| **Countdown Timer** | **Sticky Story Showcase** | ~195px | ~140px | ~64px | **ISSUE** | Sticky viewport 100vh vertical centering headspace (Issue 2) |
| **Sticky Story Showcase** | **Instagram Gallery** | ~205px | ~145px | ~64px | **ISSUE** | Sticky viewport 100vh bottom unpin dead space (Issue 3) |
| **Instagram Gallery** | **Instagram Reels** | 100px | 80px | 48px | **PASS** | Clean 50px + 50px transition |
| **Instagram Reels** | **Recent Blog Posts** | ~140px | ~110px | ~68px | **ISSUE** | Internal showcase rail padding (24px) in Reels (Issue 4) |
| **Recent Blog Posts** | **Bottom USP Bar** | 100px | 80px | 48px | **PASS** | Outer margin removed; clean 50px + 50px transition |
| **Bottom USP Bar** | **Footer** | 100px | 80px | 48px | **PASS** | Clean 50px + 50px transition |

---

## Confirmation on Global Token
- The global token `--szc-global-section-gap` (`100px` Desktop, `80px` Tablet, `48px` Mobile) is **100% CORRECT** and should **NOT** be changed.
- The 4 issues above are strictly caused by internal component geometry (absolute positioning offsets, sticky viewport 100vh flex centering, and showcase container padding), which can be resolved with surgical internal CSS adjustments without touching the global token.

