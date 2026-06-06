# Darshil Singh — Portfolio v5

A clean, minimalist, 3D/4D animated student portfolio. Built from scratch.

## Features
- Robust preloader with skip button + 5s hard timeout (never gets stuck)
- 3D Three.js background (particles, wireframe icosahedron, torus knot)
- Mouse-reactive 3D tilt on cards, achievements, memories, hero title
- Scroll-driven 4D section rotation
- Custom cursor with trail and labels
- Web Audio sound effects (toggleable, with on-screen indicator)
- 4 themes (Aurora, Sunset, Forest, Cosmic)
- Smooth scroll, active section highlight, floating dock, mini nav
- Certificate lightbox (click any award to view)
- Memories carousel with auto-advance
- Contact form (opens mail client with prefilled body)
- **Downloadable CV** — Save CV button generates a styled `Darshil_Singh_CV.html`
- Responsive, mobile drawer
- Konami code easter egg (↑↑↓↓←→←→BA)
- Original text and images preserved exactly as in portfolio V3

## Run
Open `index.html` in any modern browser. No build step required.

## File Tree
```
portfolio-v5/
├── index.html
├── styles.css
├── script.js
├── README.md
├── assets/
│   └── bg-video.mp4
└── images/
    ├── memory_gps.png
    ├── memory_sachdeva.png
    ├── WhatsApp Image 2026-05-30 at 11.37.44.jpeg
    ├── WhatsApp Image 2026-05-30 at 11.37.46.jpegs.jpeg
    ├── WhatsApp Image 2026-05-30 at 11.37s.44.jpeg
    ├── WhatsApp Image 2026-05-30 at 11s.37.45.jpeg
    ├── WhatsApp Image 2026-0s5-30 at 11.37.44.jpeg
    └── WhatsApp Imasge 2026-05-30 at 11.37.45.jpeg
```

## Notes
- All 8 image references and 50+ text fragments from the V3 source are preserved verbatim.
- Three.js is loaded asynchronously from jsDelivr; if it fails, the rest of the page works (canvas stays empty).
- Sound toggle is in the top-right of the nav; click once to enable Web Audio (required by browser autoplay policies).
