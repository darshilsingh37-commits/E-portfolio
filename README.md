# Darshil Singh — Student Portfolio V3 (Maximum Interactivity)

The most interactive version yet — floating dock with theme switcher, sound,
confetti, live clock, section mini-nav, cursor trail, click ripples, certificate
hover previews, title scramble, scroll milestone celebrations, and four color
themes. Optimized for both mobile and PC.

## How to run
- **Option 1:** double-click `index.html`.
- **Option 2 (recommended):** serve the folder with any static server:
  - `python -m http.server 5173`
  - then open: `http://localhost:5173`

## What's new in V3
- **Floating Action Dock** (bottom-right) — Theme / Sound / Confetti / Top
- **4 Color Themes** — Aurora, Sunset, Forest, Cosmic (persisted in localStorage)
- **Optional UI Sound** — subtle Web Audio clicks/hovers (toggle persists)
- **Live Clock** in the navbar
- **Section Mini-Nav** (right side) — dots for each section with progress fill
- **Click Ripples** anywhere on the page
- **Cursor Trail** (12 fading dots following the cursor)
- **Certificate Hover Preview** — small floating thumbnail on hover (desktop)
- **Title Scramble** on hero hover (letters scramble then resolve)
- **Scroll Milestones** — confetti at 25 / 50 / 75 / 100 % scroll
- **Toast Notifications** for theme/sound changes
- **Touch Vibration** feedback on tap (mobile)
- **Hero Mouse Glow** that follows the cursor

## All V2 features (still here)
- Preloader with animated logo + progress bar
- Custom cursor (dot + ring) with hover/view/text/drag states
- Particle network background reactive to cursor
- 3D tilt + glare on academic and achievement cards
- Magnetic hover on nav, buttons, dock
- Mobile drawer (slide-in panel with backdrop)
- Memory carousel with arrow nav + touch swipe + dots
- Lightbox with prev/next, click-to-zoom, keyboard nav, swipe
- GSAP scroll reveals with character-by-character title animation
- Active section highlighting, scroll progress bar
- Floating shapes that follow the cursor (parallax)
- Reduced-motion + touch-only support
- Konami-code easter egg (party mode + confetti)

## Mobile vs PC
- **Desktop:** full cursor, trail, hover previews, scramble, section mini-nav, dock tooltips
- **Mobile/Touch:** native cursor, particle network disabled for perf, drawer menu,
  swipeable memory carousel, swipeable lightbox, vibration on tap, dock in
  compact icon-only mode

## Files
- `index.html` — markup with preloader, cursor, dock, drawer, mini-nav, etc.
- `styles.css` — themes (Aurora/Sunset/Forest/Cosmic), animations, responsive
- `script.js` — all interactions
- `assets/bg-video.mp4` — background video
- `images/…` — certificates and memory photos

## Important
All original text content (every paragraph, heading, and list) and image
sources are preserved exactly as in the previous versions.
