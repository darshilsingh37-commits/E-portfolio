/* =========================================================
   Darshil Singh — Student Portfolio V3
   Maximum interactivity:
     • Preloader + click ripples
     • Custom cursor + trail (12 dots)
     • Constellation particles
     • 3D tilt cards with glare & corner accent
     • Magnetic nav / buttons / dock
     • Live clock in nav
     • Section mini-nav (right dots) with progress fill
     • Floating Action Dock: theme, sound, confetti, top
     • Mobile drawer + touch gestures
     • Memory carousel (desktop + swipe)
     • Lightbox with prev/next, zoom + pan, swipe
     • Certificate hover preview (desktop)
     • Hero title scramble on hover
      • GSAP scroll reveals with character animations
      • 4 color themes (Aurora, Sunset, Forest, Cosmic)
     • Optional Web Audio sound effects
     • Touch vibration on tap (mobile)
     • Konami code easter egg
   All original text and image sources are preserved.
   ========================================================= */

(function () {
    'use strict';

    document.documentElement.classList.add('js');

    /* -------------------------
       Helpers
       ------------------------- */
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
    const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const onReady = (fn) =>
        document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn);
    const rand = (a, b) => a + Math.random() * (b - a);
    const randi = (a, b) => Math.floor(rand(a, b + 1));

    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const STORAGE_THEME = 'ds_theme';
    const STORAGE_SOUND = 'ds_sound';

    /* -------------------------
       Toast notification
       ------------------------- */
    const showToast = (msg, icon = 'circle-info') => {
        const host = $('#toastHost');
        if (!host) return;
        const t = document.createElement('div');
        t.className = 'toast';
        t.innerHTML = `<i class="fas fa-${icon}"></i><span>${msg}</span>`;
        host.appendChild(t);
        setTimeout(() => t.remove(), 3300);
    };

    /* -------------------------
       Web Audio sound effects
       ------------------------- */
    const Sound = (() => {
        let ctx = null;
        let enabled = localStorage.getItem(STORAGE_SOUND) === '1';
        const ensure = () => {
            if (ctx) return ctx;
            try {
                ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) { return null; }
            return ctx;
        };
        const tone = (freq = 660, dur = 0.08, type = 'sine', vol = 0.06) => {
            if (!enabled) return;
            const ac = ensure();
            if (!ac) return;
            const o = ac.createOscillator();
            const g = ac.createGain();
            o.type = type;
            o.frequency.value = freq;
            g.gain.value = 0;
            g.gain.linearRampToValueAtTime(vol, ac.currentTime + 0.005);
            g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
            o.connect(g).connect(ac.destination);
            o.start();
            o.stop(ac.currentTime + dur);
        };
        return {
            get enabled() { return enabled; },
            toggle() {
                enabled = !enabled;
                localStorage.setItem(STORAGE_SOUND, enabled ? '1' : '0');
                if (enabled) {
                    ensure();
                    this.pop();
                }
                return enabled;
            },
            click: () => tone(720, 0.05, 'triangle', 0.04),
            hover: () => tone(540, 0.04, 'sine', 0.02),
            pop: () => tone(880, 0.1, 'triangle', 0.06),
            success: () => {
                tone(660, 0.08, 'sine', 0.05);
                setTimeout(() => tone(880, 0.1, 'sine', 0.05), 80);
                setTimeout(() => tone(1175, 0.12, 'sine', 0.05), 170);
            }
        };
    })();

    /* -------------------------
       Preloader
       ------------------------- */
    const initPreloader = () => {
        const el = $('#preloader');
        if (!el) return;
        const fill = el.querySelector('.preloader__fill');
        let p = 0;
        const tick = () => {
            p = Math.min(100, p + Math.random() * 12 + 4);
            if (fill) fill.style.width = `${p}%`;
            if (p < 92) setTimeout(tick, 90);
        };
        tick();
        const finish = () => {
            if (fill) fill.style.width = '100%';
            setTimeout(() => el.classList.add('is-done'), 350);
            setTimeout(() => el.remove(), 1400);
        };
        if (document.readyState === 'complete') setTimeout(finish, 500);
        else window.addEventListener('load', () => setTimeout(finish, 500));
    };

    /* -------------------------
       Background video control
       - Works on phone (iOS Safari, Android Chrome, WeChat)
       - Tries autoplay, falls back to a tap-to-play overlay
       - Pauses when the tab is hidden, resumes when visible
       - Honors data-saver + prefers-reduced-motion
       ------------------------- */
    const initBgVideo = () => {
        const wrap = document.querySelector('.bg-video');
        const v = document.getElementById('bgVideo') || document.querySelector('.bg-video video');
        const tap = document.getElementById('bgVideoTap');
        if (!v || !wrap) return;

        // iOS / iPadOS detection (still useful for tweaks)
        const isIOS = /iP(hone|ad|od)/.test(navigator.platform) ||
            (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
        const isAndroid = /Android/i.test(navigator.userAgent);

        // Respect data-saver and reduced-motion — keep the static overlay + poster look
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const saveData = !!(conn && conn.saveData);
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reducedMotion || saveData) {
            v.pause();
            v.removeAttribute('autoplay');
            v.preload = 'none';
            return;
        }

        // iOS / WeChat friendly attributes
        v.muted = true;
        v.setAttribute('muted', '');
        v.setAttribute('playsinline', '');
        v.setAttribute('webkit-playsinline', 'true');
        v.setAttribute('x5-video-player-type', 'h5');
        v.setAttribute('x5-video-orientation', 'portrait');
        v.setAttribute('disablepictureinpicture', '');
        v.setAttribute('disableremoteplayback', '');
        v.playsInline = true;
        v.loop = true;

        // Set the source via JS for reliability on some mobile browsers
        try {
            if (!v.currentSrc && !v.src) {
                const source = v.querySelector('source');
                if (source && source.src) {
                    const url = source.getAttribute('src');
                    v.src = url;
                }
            }
        } catch (_) { /* ignore */ }

        const showTap = () => {
            wrap.classList.add('is-paused');
            if (tap) tap.style.display = '';
        };
        const hideTap = () => {
            wrap.classList.remove('is-paused');
        };

        const tryPlay = () => {
            const p = v.play();
            if (p && typeof p.then === 'function') {
                p.then(() => { hideTap(); })
                 .catch(() => { showTap(); });
            } else {
                hideTap();
            }
        };

        // Initial autoplay attempt (works on Android / desktop; iOS often needs a gesture)
        tryPlay();

        // If metadata fails to load on mobile, surface the tap-to-play fallback
        v.addEventListener('error', showTap, { once: true });
        v.addEventListener('stalled', showTap, { once: true });

        // On the very first user gesture, retry play. This satisfies iOS Safari.
        const onFirstGesture = () => {
            tryPlay();
            ['pointerdown', 'touchstart', 'click', 'keydown', 'scroll'].forEach((ev) =>
                document.removeEventListener(ev, onFirstGesture, { capture: true })
            );
        };
        ['pointerdown', 'touchstart', 'click', 'keydown', 'scroll'].forEach((ev) =>
            document.addEventListener(ev, onFirstGesture, { capture: true, once: false, passive: true })
        );

        // Tap-to-play button explicitly tries to start the video
        if (tap) {
            tap.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                v.muted = true;          // must be muted for mobile autoplay
                v.currentTime = 0;
                const p = v.play();
                if (p && typeof p.then === 'function') {
                    p.then(hideTap).catch(() => { /* still blocked, keep the tap button */ });
                } else {
                    hideTap();
                }
            });
        }

        // Pause when tab hidden; resume when visible
        const onVis = () => {
            if (document.hidden) { v.pause(); return; }
            tryPlay();
        };
        document.addEventListener('visibilitychange', onVis);

        // iOS sometimes pauses inline video when the app backgrounds — re-sync on focus
        window.addEventListener('pageshow', () => { tryPlay(); });
        window.addEventListener('focus', () => { tryPlay(); });

        // Stop decoding on slow connections / low battery
        const pauseIfHidden = () => { if (document.hidden) v.pause(); };
        document.addEventListener('visibilitychange', pauseIfHidden);
        v.addEventListener('pause', () => { if (!document.hidden) showTap(); });
        v.addEventListener('playing', () => { hideTap(); });
    };

    /* -------------------------
       Click ripple
       ------------------------- */
    const initRipples = () => {
        const layer = $('#rippleLayer');
        if (!layer) return;
        document.addEventListener('click', (e) => {
            if (e.target.closest('.no-ripple')) return;
            if (navigator.vibrate && isTouch) navigator.vibrate(10);
            const r1 = document.createElement('span');
            r1.className = 'ripple';
            r1.style.left = `${e.clientX}px`;
            r1.style.top = `${e.clientY}px`;
            const r2 = document.createElement('span');
            r2.className = 'ripple ripple--alt';
            r2.style.left = `${e.clientX}px`;
            r2.style.top = `${e.clientY}px`;
            layer.appendChild(r1);
            layer.appendChild(r2);
            setTimeout(() => r1.remove(), 950);
            setTimeout(() => r2.remove(), 950);
            Sound.click();
        });
    };

    /* -------------------------
       Custom Cursor + Trail
       40+ variant states: hover, view, drag, text, label, down,
       link, play, grab, crosshair, loading, resize-h, resize-v,
       disabled, arrow-left, arrow-right, eye, heart, plus, brush,
       zoom, pen, camera, send, save, share, music, book, mail, code,
       bulb, target, star, lock, search, square, diamond, blob, arrow,
       color tints, animations: bounce, shake, blink, wiggle,
       spin-slow, beat, tilt
       Plus: magnetic-snap, click-burst, scroll-velocity, section
       theming, 3D tilt on cards.
       ------------------------- */
    const initCursor = () => {
        if (isTouch || !isFinePointer || prefersReducedMotion) return;
        const cursor = $('#cursor');
        const trail = $('#cursorTrail');
        if (!cursor || !trail) return;
        const dot = cursor.querySelector('.cursor__dot');
        const ring = cursor.querySelector('.cursor__ring');
        const label = cursor.querySelector('.cursor__label');

        document.body.classList.add('has-cursor');

        // Visual helper for magnetic elements (a dashed ring that follows)
        const magnetRing = document.createElement('div');
        magnetRing.className = 'cursor-magnet-ring';
        document.body.appendChild(magnetRing);

        // Container for click-burst particles (uses the existing ripple-layer visually)
        const burstLayer = document.createElement('div');
        burstLayer.className = 'cursor-burst-layer';
        burstLayer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9000;overflow:hidden;';
        document.body.appendChild(burstLayer);

        const ALL_STATES = [
            'is-hover','is-view','is-drag','is-text','is-label','is-down',
            'is-link','is-play','is-grab','is-crosshair','is-loading',
            'is-resize-h','is-resize-v','is-disabled','is-arrow-left','is-arrow-right',
            'is-eye','is-heart','is-plus','is-brush','is-zoom',
            'is-pulse','is-magnet','is-magnetic-snap','is-tilt',
            'is-pen','is-camera','is-send','is-save','is-share','is-music',
            'is-book','is-mail','is-code','is-bulb','is-target','is-star',
            'is-lock','is-search','is-square','is-diamond','is-blob','is-arrow',
            'is-tint-pink','is-tint-green','is-tint-orange','is-tint-purple',
            'is-tint-rose','is-tint-amber',
            'is-bounce','is-shake','is-blink','is-wiggle','is-spin-slow','is-beat',
            'is-section','is-fast','is-slow'
        ];

        const TRAIL_N = 14;
        const trailDots = [];
        for (let i = 0; i < TRAIL_N; i++) {
            const d = document.createElement('span');
            d.className = 'trail-dot';
            trail.appendChild(d);
            trailDots.push({ el: d, x: 0, y: 0, life: 0 });
        }

        const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const pos = { x: mouse.x, y: mouse.y };
        const targetPos = { x: mouse.x, y: mouse.y };
        let active = false;
        let lastMoveAt = performance.now();
        let lastX = mouse.x, lastY = mouse.y;
        let velocity = 0;

        const setState = (cls) => {
            cursor.classList.remove(...ALL_STATES);
            if (cls) cursor.classList.add(...cls.split(/\s+/).filter(Boolean));
        };
        const addState = (cls) => { if (cls) cursor.classList.add(...cls.split(/\s+/).filter(Boolean)); };
        const removeState = (cls) => { if (cls) cursor.classList.remove(...cls.split(/\s+/).filter(Boolean)); };

        // Map a data-cursor value to one or more state classes
        const mapCursorLabel = (val) => {
            if (!val) return null;
            const v = String(val).trim().toLowerCase();
            if (!v) return null;
            const direct = {
                'play':'is-play','pause':'is-play',
                'link':'is-link','open':'is-link',
                'drag':'is-grab','grab':'is-grab',
                'crosshair':'is-crosshair','aim':'is-crosshair',
                'loading':'is-loading','wait':'is-loading','busy':'is-loading',
                'resize h':'is-resize-h','resize-h':'is-resize-h','ew':'is-resize-h',
                'resize v':'is-resize-v','resize-v':'is-resize-v','ns':'is-resize-v',
                'disabled':'is-disabled','no':'is-disabled','not-allowed':'is-disabled',
                'prev':'is-arrow-left','previous':'is-arrow-left','left':'is-arrow-left',
                'next':'is-arrow-right','right':'is-arrow-right',
                'view':'is-zoom','zoom':'is-zoom','eye':'is-eye',
                'heart':'is-heart','favorite':'is-heart','fav':'is-heart',
                'plus':'is-plus','add':'is-plus','create':'is-plus',
                'brush':'is-brush','paint':'is-brush',
                'pen':'is-pen','write':'is-pen','edit':'is-pen',
                'camera':'is-camera','photo':'is-camera','image':'is-camera',
                'send':'is-send','plane':'is-send','paper-plane':'is-send',
                'save':'is-save','download':'is-save','disk':'is-save',
                'share':'is-share','forward':'is-share',
                'music':'is-music','note':'is-music','song':'is-music',
                'book':'is-book','read':'is-book',
                'mail':'is-mail','email':'is-mail','envelope':'is-mail','message':'is-mail',
                'code':'is-code','brackets':'is-code','dev':'is-code',
                'bulb':'is-bulb','idea':'is-bulb','light':'is-bulb',
                'target':'is-target','reticle':'is-target',
                'star':'is-star','rating':'is-star',
                'lock':'is-lock','secure':'is-lock','private':'is-lock',
                'search':'is-search','find':'is-search','magnify':'is-search',
                'square':'is-square','box':'is-square',
                'diamond':'is-diamond','gem':'is-diamond',
                'blob':'is-blob','organic':'is-blob',
                'pointer':'is-arrow','cursor':'is-arrow',
                'bounce':'is-bounce',
                'shake':'is-shake',
                'blink':'is-blink',
                'wiggle':'is-wiggle',
                'spin':'is-spin-slow',
                'beat':'is-beat','pulse-beat':'is-beat',
                'pink':'is-tint-pink',
                'green':'is-tint-green',
                'orange':'is-tint-orange',
                'purple':'is-tint-purple',
                'rose':'is-tint-rose','red':'is-tint-rose',
                'amber':'is-tint-amber','yellow':'is-tint-amber',
                'magnet':'is-magnetic-snap','snap':'is-magnetic-snap'
            };
            if (direct[v]) return direct[v];
            // Default: fall back to label + hover
            return 'is-label is-hover';
        };

        // Click-burst: emit 8 particles from the click point
        // Click-burst: emit particles from the click point.
        // N = number of particles, spread = max distance (px).
        const emitBurst = (x, y, N = 8, spread = 60) => {
            for (let i = 0; i < N; i++) {
                const angle = (i / N) * Math.PI * 2;
                const dist = spread * (0.5 + Math.random() * 0.5);
                const size = 4 + Math.random() * 5;
                const p = document.createElement('span');
                p.className = 'click-burst';
                p.style.left = x + 'px';
                p.style.top = y + 'px';
                p.style.width = size + 'px';
                p.style.height = size + 'px';
                p.style.setProperty('--bx', `${Math.cos(angle) * dist}px`);
                p.style.setProperty('--by', `${Math.sin(angle) * dist}px`);
                p.style.setProperty('--bs', `${0.2 + Math.random() * 0.4}`);
                const useAlt = i % 2 === 0;
                p.style.background = useAlt ? 'var(--accent-2)' : 'var(--accent)';
                burstLayer.appendChild(p);
                setTimeout(() => p.remove(), 750);
            }
        };

        // Find nearest .magnetic element to the cursor
        const findNearestMagnetic = (mx, my) => {
            const els = document.querySelectorAll('.magnetic, [data-magnetic]');
            let best = null, bestD = Infinity;
            els.forEach((el) => {
                const r = el.getBoundingClientRect();
                if (r.width === 0 || r.height === 0) return;
                const cx = r.left + r.width / 2;
                const cy = r.top + r.height / 2;
                const d = Math.hypot(mx - cx, my - cy);
                if (d < bestD) { bestD = d; best = { el, r, cx, cy, d }; }
            });
            return best;
        };

        // 3D Tilt on .tilt-3d elements while cursor moves over them
        const applyTilt = (mx, my) => {
            const els = document.querySelectorAll('.tilt-3d:hover');
            els.forEach((el) => {
                const r = el.getBoundingClientRect();
                const px = (mx - r.left) / r.width;
                const py = (my - r.top) / r.height;
                const tx = (px - 0.5) * 10;   // -5deg .. +5deg
                const ty = (py - 0.5) * -10;
                el.style.setProperty('--tx', `${tx}deg`);
                el.style.setProperty('--ty', `${ty}deg`);
                el.style.transform = `perspective(900px) rotateX(${ty}deg) rotateY(${tx}deg) translateY(-2px)`;
            });
        };
        const resetTilt = (e) => {
            const el = e.currentTarget;
            el.style.transform = '';
            el.style.removeProperty('--tx');
            el.style.removeProperty('--ty');
        };
        document.querySelectorAll('.tilt-3d').forEach((el) => {
            el.addEventListener('mouseleave', resetTilt);
        });

        // Section theming — observe which <section id> is in view
        const sections = document.querySelectorAll('section[id], .section[id]');
        if ('IntersectionObserver' in window && sections.length) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const ctx = entry.target.getAttribute('data-ctx') || entry.target.id;
                        if (ctx) document.body.setAttribute('data-ctx', ctx);
                    }
                });
            }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
            sections.forEach((s) => io.observe(s));
        }

        // Scroll-velocity: scale the cursor inversely with scroll speed
        let lastScrollY = window.scrollY, scrollVel = 0;
        const onScroll = () => {
            const y = window.scrollY;
            scrollVel = Math.abs(y - lastScrollY);
            lastScrollY = y;
            if (scrollVel > 8)      addState('is-fast');
            else if (scrollVel < 1) addState('is-slow');
            else { removeState('is-fast'); removeState('is-slow'); }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        // Auto-clear the velocity state when scroll settles
        setInterval(() => { scrollVel *= 0.6; if (scrollVel < 1) removeState('is-fast'); }, 120);

        const onMove = (e) => {
            const dx = e.clientX - lastX, dy = e.clientY - lastY;
            lastX = e.clientX; lastY = e.clientY;
            velocity = Math.hypot(dx, dy);
            lastMoveAt = performance.now();

            // Magnetic snap: if close to a .magnetic element, gently pull the target position
            // toward its center. The visual cursor still follows the lerp; the target pulls in.
            const near = findNearestMagnetic(e.clientX, e.clientY);
            if (near && near.d < 90) {
                addState('is-magnetic-snap');
                const strength = 1 - (near.d / 90);     // 0..1
                targetPos.x = e.clientX + (near.cx - e.clientX) * 0.18 * strength;
                targetPos.y = e.clientY + (near.cy - e.clientY) * 0.18 * strength;

                // Show the dashed magnet ring around the magnetic element
                const r = near.r;
                magnetRing.style.left = (r.left + r.width / 2) + 'px';
                magnetRing.style.top = (r.top + r.height / 2) + 'px';
                magnetRing.style.width = Math.max(r.width, r.height) + 'px';
                magnetRing.style.height = Math.max(r.width, r.height) + 'px';
                magnetRing.classList.add('is-active');

                // Drive the magnetic element's offset too (subtle pull)
                near.el.style.transform = `translate(${(near.cx - e.clientX) * -0.06}px, ${(near.cy - e.clientY) * -0.06}px)`;
            } else {
                removeState('is-magnetic-snap');
                magnetRing.classList.remove('is-active');
                targetPos.x = e.clientX;
                targetPos.y = e.clientY;
            }

            mouse.x = e.clientX;
            mouse.y = e.clientY;

            // Tilt: tilt any hovered .tilt-3d card
            applyTilt(e.clientX, e.clientY);

            // Set rotation of the ring based on movement direction (visual flair)
            if (ring) {
                const tilt = Math.max(-25, Math.min(25, dx * 4));
                ring.style.setProperty('--cx-tilt', `${tilt}deg`);
            }

            // Hero glow tracking (existing)
            const glow = $('#heroGlow');
            if (glow) {
                const r = glow.getBoundingClientRect();
                const gx = ((e.clientX - r.left) / r.width) * 100;
                const gy = ((e.clientY - r.top) / r.height) * 100;
                glow.style.setProperty('--gx', `${gx}%`);
                glow.style.setProperty('--gy', `${gy}%`);
            }
        };

        const onEnter = (e) => {
            const t = e.target;
            if (!(t instanceof Element)) return;

            // data-cursor="..." with optional data-cursor-color / data-cursor-anim
            const labelEl = t.closest('[data-cursor]');
            if (labelEl) {
                const val = labelEl.getAttribute('data-cursor') || '';
                const state = mapCursorLabel(val);
                if (state && state.includes('is-label')) {
                    setState('is-label is-hover');
                } else if (state) {
                    setState(state);
                } else {
                    setState('is-label is-hover');
                }
                if (label) label.textContent = val;
            } else {
                // Detect the element class
                const hoverable = t.closest('a, button, [role="button"], .magnetic, .tilt, .btn, summary, label');
                const viewable = t.closest('[data-zoomable], img.cert-fix, .certificate-image');
                const text = t.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote, .nav-link, .card-title');
                const draggable = t.closest('[draggable="true"], .draggable, .carousel');
                const resizeH = t.closest('[data-cursor-resize="h"], .resizable-x, .splitter-h');
                const resizeV = t.closest('[data-cursor-resize="v"], .resizable-y, .splitter-v');
                const formField = t.closest('input, textarea, select, [contenteditable="true"]');
                const isDisabled = t.closest('[disabled], [aria-disabled="true"], .is-disabled');
                const isLoading = t.closest('[data-loading="true"], .is-loading, [aria-busy="true"]');
                const tiltEl = t.closest('.tilt-3d');

                if (isLoading)        setState('is-loading');
                else if (isDisabled && !hoverable) setState('is-disabled');
                else if (resizeH)     setState('is-resize-h');
                else if (resizeV)     setState('is-resize-v');
                else if (draggable)   setState('is-grab');
                else if (viewable)    setState('is-zoom');
                else if (formField)   setState('is-text');
                else if (text && !hoverable) setState('is-text');
                else if (tiltEl)      setState('is-tilt');
                else if (hoverable) {
                    const isPrimary = hoverable.classList.contains('btn--primary') ||
                                      hoverable.classList.contains('dock__btn');
                    const style = (document.body.dataset.cursorStyle || 'classic').toLowerCase();

                    // Per-style interaction on hover
                    let extras = '';
                    if (style === 'glitch') extras = 'is-shake';
                    else if (style === 'aurora') extras = 'is-bounce';
                    else if (style === 'neon') extras = 'is-pulse';
                    else if (style === 'minimal') extras = '';
                    else if (style === 'liquid') extras = 'is-bounce';
                    else extras = ''; // classic

                    setState(`is-hover ${extras}`.trim());
                    if (Math.random() < 0.1) Sound.hover();
                } else {
                    setState(null);
                }
            }

            // Apply data-cursor-color (e.g. "pink", "green", ...) and data-cursor-anim
            const hint = t.closest('[data-cursor-color], [data-cursor-anim]');
            if (hint) {
                const color = hint.getAttribute('data-cursor-color');
                if (color) {
                    const cls = mapCursorLabel(color);
                    if (cls) addState(cls);
                }
                const anim = hint.getAttribute('data-cursor-anim');
                if (anim) {
                    const cls = mapCursorLabel(anim);
                    if (cls) addState(cls);
                }
            }
        };

        const onLeave = (e) => {
            const t = e.target;
            if (!(t instanceof Element)) return;
            // Reset magnetic-element offset if we were hovering a magnetic
            const mag = t.closest('.magnetic, [data-magnetic]');
            if (mag) mag.style.transform = '';
        };

        const onDown = (e) => {
            const cls = (cursor.className.match(/is-[a-z-]+/g) || []).filter((c) => c !== 'is-down');
            cursor.className = `cursor ${cls.join(' ')} is-down`;
            // Per-style click effects + emit click-burst (skip with shift)
            if (!e.shiftKey) {
                const style = (document.body.dataset.cursorStyle || 'classic').toLowerCase();
                // Neon gets a bigger burst; Liquid gets a wider spread; Glitch gets more particles
                if (style === 'neon') emitBurst(e.clientX, e.clientY, 14, 90);
                else if (style === 'liquid') emitBurst(e.clientX, e.clientY, 12, 80);
                else if (style === 'glitch') emitBurst(e.clientX, e.clientY, 16, 70);
                else if (style === 'aurora') emitBurst(e.clientX, e.clientY, 10, 100);
                else if (style === 'minimal') { /* minimal has no burst — keep clean */ }
                else emitBurst(e.clientX, e.clientY, 8, 60);
            }
        };
        const onUp = () => {
            const cls = (cursor.className.match(/is-[a-z-]+/g) || []).filter((c) => c !== 'is-down');
            cursor.className = `cursor ${cls.join(' ')}`;
        };

        // Arrow keys + nav buttons trigger left/right cursor
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft')  { setState('is-arrow-left'); }
            else if (e.key === 'ArrowRight') { setState('is-arrow-right'); }
        });
        window.addEventListener('keyup', () => {
            // Don't clear the section state — that comes from onEnter
            removeState('is-arrow-left'); removeState('is-arrow-right');
        });

        // Render loop: lerp the cursor toward `pos`, with magnetic pull
        const render = () => {
            if (!active) return;
            // Pos chases target (mouse + magnetic pull)
            pos.x = lerp(pos.x, targetPos.x, 0.22);
            pos.y = lerp(pos.y, targetPos.y, 0.22);
            if (dot) dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
            if (ring) {
                // Preserve tilt rotation for .is-tilt states
                const tiltVal = (cursor.classList.contains('is-tilt') || cursor.classList.contains('is-tilt-down'))
                    ? ` rotate(var(--cx-tilt, 0deg))` : '';
                ring.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)${tiltVal}`;
            }

            // Trail (color matches current trail base = --accent)
            let prevX = pos.x, prevY = pos.y;
            for (let i = 0; i < trailDots.length; i++) {
                const t = trailDots[i];
                t.x = lerp(t.x, prevX, 0.35);
                t.y = lerp(t.y, prevY, 0.35);
                const scale = 1 - i * 0.06;
                const alpha = (1 - i / trailDots.length) * 0.8;
                t.el.style.transform = `translate(${t.x}px, ${t.y}px) translate(-50%, -50%) scale(${scale})`;
                t.el.style.opacity = alpha;
                prevX = t.x;
                prevY = t.y;
            }

            requestAnimationFrame(render);
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('mouseover', onEnter, { passive: true });
        window.addEventListener('mouseout', onLeave, { passive: true });
        window.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);
        document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; trail.style.opacity = '0'; magnetRing.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; trail.style.opacity = '1'; magnetRing.style.opacity = '1'; });

        active = true;
        render();
    };

    /* -------------------------
       Particle Network
       ------------------------- */
    const initParticles = () => {
        if (isTouch || prefersReducedMotion) return;
        const canvas = $('#particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        let particles = [];
        const mouse = { x: -9999, y: -9999, active: false };
        let running = true;
        let accent = '110, 231, 255';
        let accent2 = '167, 139, 250';

        const setSize = () => {
            w = window.innerWidth; h = window.innerHeight;
            canvas.width = w * dpr; canvas.height = h * dpr;
            canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        const target = isMobile ? 28 : isFinePointer ? 70 : 50;
        const dist = 130;

        const updateColors = () => {
            const cs = getComputedStyle(document.body);
            const a1 = cs.getPropertyValue('--accent').trim();
            const a2 = cs.getPropertyValue('--accent-2').trim();
            accent = hexToRgbString(a1);
            accent2 = hexToRgbString(a2);
        };
        const hexToRgbString = (h) => {
            if (!h) return '110, 231, 255';
            h = h.replace('#', '');
            if (h.length === 3) h = h.split('').map((c) => c + c).join('');
            const n = parseInt(h, 16);
            return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
        };

        const make = () => {
            const speed = Math.random() * 0.35 + 0.12;
            const angle = Math.random() * Math.PI * 2;
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                r: Math.random() * 1.6 + 0.4,
                hue: Math.random() < 0.5 ? accent : accent2,
                pulse: Math.random() * Math.PI * 2
            };
        };
        const init = () => {
            setSize();
            updateColors();
            const count = Math.min(target, Math.floor((w * h) / 18000));
            particles = Array.from({ length: count }, make);
        };
        const step = () => {
            if (!running) return;
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy; p.pulse += 0.04;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                if (mouse.active) {
                    const dx = p.x - mouse.x, dy = p.y - mouse.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < 120 * 120) {
                        const f = (1 - Math.sqrt(d2) / 120) * 0.6;
                        p.x += (dx / Math.sqrt(d2 + 1)) * f;
                        p.y += (dy / Math.sqrt(d2 + 1)) * f;
                    }
                }
                const a = 0.45 + Math.sin(p.pulse) * 0.2;
                ctx.beginPath();
                ctx.fillStyle = `rgba(${p.hue}, ${a})`;
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dx = p.x - q.x, dy = p.y - q.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < dist * dist) {
                        const a2 = 1 - Math.sqrt(d2) / dist;
                        ctx.strokeStyle = `rgba(${p.hue}, ${a2 * 0.22})`;
                        ctx.lineWidth = 0.6;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(step);
        };
        const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; };
        const onLeave = () => { mouse.active = false; mouse.x = -9999; mouse.y = -9999; };
        const onVis = () => { running = !document.hidden; if (running) requestAnimationFrame(step); };
        const onResize = () => { clearTimeout(window.__prt); window.__prt = setTimeout(init, 200); };

        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('mouseleave', onLeave);
        window.addEventListener('blur', onLeave);
        document.addEventListener('visibilitychange', onVis);
        window.addEventListener('resize', onResize);

        const themeObs = new MutationObserver(() => updateColors());
        themeObs.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

        init();
        requestAnimationFrame(step);
    };

    /* -------------------------
       3D Tilt
       ------------------------- */
    const initTilt = () => {
        if (isTouch || prefersReducedMotion) return;
        const cards = $$('.tilt');
        if (!cards.length) return;
        cards.forEach((card) => {
            const max = parseFloat(card.dataset.tiltMax) || 8;
            const scale = parseFloat(card.dataset.tiltScale) || 1;
            const shine = card.querySelector('.card__shine');
            let rect = null;
            let target = { rx: 0, ry: 0, gx: 50, gy: 50, o: 0 };
            let cur = { ...target };

            const refresh = () => { rect = card.getBoundingClientRect(); };
            window.addEventListener('resize', refresh, { passive: true });
            window.addEventListener('scroll', refresh, { passive: true });

            const onMove = (e) => {
                if (!rect) refresh();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                target.ry = (x - 0.5) * (max * 2);
                target.rx = -(y - 0.5) * (max * 2);
                target.gx = x * 100; target.gy = y * 100;
                target.o = 1;
            };
            const onLeave = () => { target.rx = 0; target.ry = 0; target.o = 0; };

            const loop = () => {
                cur.rx = lerp(cur.rx, target.rx, 0.12);
                cur.ry = lerp(cur.ry, target.ry, 0.12);
                cur.gx = lerp(cur.gx, target.gx, 0.2);
                cur.gy = lerp(cur.gy, target.gy, 0.2);
                cur.o = lerp(cur.o, target.o, 0.12);
                card.style.transform = `perspective(1000px) rotateX(${cur.rx}deg) rotateY(${cur.ry}deg) scale(${scale})`;
                if (shine) {
                    shine.style.setProperty('--shine-x', `${cur.gx}%`);
                    shine.style.setProperty('--shine-y', `${cur.gy}%`);
                    shine.style.opacity = cur.o;
                }
                requestAnimationFrame(loop);
            };
            refresh(); loop();
            card.addEventListener('mouseenter', refresh);
            card.addEventListener('mousemove', onMove);
            card.addEventListener('mouseleave', onLeave);
        });
    };

    /* -------------------------
       Magnetic
       ------------------------- */
    const initMagnetic = () => {
        if (isTouch || prefersReducedMotion) return;
        const items = $$('.magnetic');
        if (!items.length) return;
        const strength = 0.28;
        items.forEach((el) => {
            let rect = null, tx = 0, ty = 0, cx = 0, cy = 0;
            const onMove = (e) => {
                if (!rect) rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                tx = x * strength; ty = y * strength;
            };
            const onLeave = () => { tx = 0; ty = 0; rect = null; };
            const loop = () => {
                cx = lerp(cx, tx, 0.18); cy = lerp(cy, ty, 0.18);
                el.style.transform = `translate(${cx}px, ${cy}px)`;
                requestAnimationFrame(loop);
            };
            el.addEventListener('mouseenter', () => { rect = el.getBoundingClientRect(); });
            el.addEventListener('mousemove', onMove);
            el.addEventListener('mouseleave', onLeave);
            loop();
        });
    };

    /* -------------------------
       Floater parallax
       ------------------------- */
    const initFloaterParallax = () => {
        if (isTouch || prefersReducedMotion) return;
        const f = $$('.floater');
        if (!f.length) return;
        const strength = [0.04, -0.06, 0.08, -0.05];
        let tx = 0, ty = 0, cx = 0, cy = 0;
        window.addEventListener('mousemove', (e) => {
            tx = (e.clientX - window.innerWidth / 2) / window.innerWidth;
            ty = (e.clientY - window.innerHeight / 2) / window.innerHeight;
        }, { passive: true });
        const loop = () => {
            cx = lerp(cx, tx, 0.06); cy = lerp(cy, ty, 0.06);
            f.forEach((el, i) => {
                const s = strength[i % strength.length];
                el.style.transform = `translate(${cx * s * 80}px, ${cy * s * 80}px)`;
            });
            requestAnimationFrame(loop);
        };
        loop();
    };

    /* -------------------------
       Live Clock
       ------------------------- */
    const initClock = () => {
        const el = $('[data-clock]');
        if (!el) return;
        const update = () => {
            const d = new Date();
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            const ss = String(d.getSeconds()).padStart(2, '0');
            el.textContent = `${hh}:${mm}`;
            el.title = `${hh}:${mm}:${ss}`;
        };
        update();
        setInterval(update, 30000);
    };

    /* -------------------------
       Navbar + Scroll Progress
       ------------------------- */
    const initNav = () => {
        const navbar = $('#navbar');
        const progressBar = $('.scroll-progress__bar');
        const sectionFill = $('#sectionProgressFill');
        let raf = 0;
        let maxScroll = 1;

        const measure = () => {
            maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        };

        const update = () => {
            const y = window.scrollY;
            if (navbar) navbar.classList.toggle('is-scrolled', y > 40);
            const p = clamp((y / maxScroll) * 100, 0, 100);
            if (progressBar) progressBar.style.width = `${p}%`;
            if (sectionFill) sectionFill.style.height = `${p}%`;
            raf = 0;
        };

        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(update);
        };

        const onResize = () => { measure(); onScroll(); };

        measure();
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });
    };

    /* -------------------------
       Section Mini-Nav
       ------------------------- */
    const initSectionNav = () => {
        const dots = $$('.section-nav__dot');
        if (!dots.length) return;
        const sections = $$('main section[id]');
        const byHref = new Map();
        dots.forEach((d) => byHref.set(d.getAttribute('href')?.replace('#', ''), d));

        const setActive = (id) => {
            dots.forEach((d) => d.classList.remove('is-active'));
            const el = byHref.get(id);
            if (el) el.classList.add('is-active');
        };

        if (prefersReducedMotion) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActive(e.target.id);
                });
            }, { threshold: 0.5, rootMargin: '-100px 0px -50% 0px' });
            sections.forEach((s) => io.observe(s));
        } else if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
            sections.forEach((s) => {
                window.ScrollTrigger.create({
                    trigger: s,
                    start: 'top 50%',
                    end: 'bottom 50%',
                    onEnter: () => setActive(s.id),
                    onEnterBack: () => setActive(s.id)
                });
            });
        } else {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActive(e.target.id);
                });
            }, { threshold: 0.5, rootMargin: '-100px 0px -50% 0px' });
            sections.forEach((s) => io.observe(s));
        }
    };

    /* -------------------------
       Floating Dock
       ------------------------- */
    const initDock = () => {
        const dock = $('#dock');
        if (!dock) return;
        const themeBtn = $('#themeBtn');
        const soundBtn = $('#soundBtn');
        const cvBtn = $('#cvBtn');
        const backBtn = $('#backTop');

        const themes = ['aurora', 'sunset', 'forest', 'cosmic'];
        const cycleTheme = () => {
            const current = document.body.getAttribute('data-theme') || 'aurora';
            const idx = themes.indexOf(current);
            const next = themes[(idx + 1) % themes.length];
            document.body.setAttribute('data-theme', next);
            localStorage.setItem(STORAGE_THEME, next);
            showToast(`Theme: ${next[0].toUpperCase() + next.slice(1)}`, 'palette');
            Sound.pop();
        };
        themeBtn?.addEventListener('click', cycleTheme);

        // Sound toggle
        const syncSoundBtn = () => {
            if (!soundBtn) return;
            const ic = soundBtn.querySelector('i');
            if (Sound.enabled) {
                soundBtn.classList.add('is-on');
                soundBtn.setAttribute('aria-pressed', 'true');
                if (ic) { ic.className = 'fas fa-volume-high'; }
            } else {
                soundBtn.classList.remove('is-on');
                soundBtn.setAttribute('aria-pressed', 'false');
                if (ic) { ic.className = 'fas fa-volume-xmark'; }
            }
        };
        syncSoundBtn();
        soundBtn?.addEventListener('click', () => {
            const on = Sound.toggle();
            syncSoundBtn();
            showToast(`Sound: ${on ? 'On' : 'Off'}`, on ? 'volume-high' : 'volume-xmark');
            if (on) Sound.success();
        });

        cvBtn?.addEventListener('click', () => {
            downloadCV();
            cvBtn.classList.add('is-flash');
            setTimeout(() => cvBtn.classList.remove('is-flash'), 700);
        });

        backBtn?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    };

    /* -------------------------
       Drawer (mobile)
       ------------------------- */
    const initDrawer = () => {
        const drawer = $('#drawer');
        const toggle = $('#menuToggle');
        if (!drawer || !toggle) return;
        const open = () => {
            drawer.classList.add('is-open');
            drawer.setAttribute('aria-hidden', 'false');
            toggle.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        };
        const close = () => {
            drawer.classList.remove('is-open');
            drawer.setAttribute('aria-hidden', 'true');
            toggle.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        };
        toggle.addEventListener('click', () => (drawer.classList.contains('is-open') ? close() : open()));
        drawer.querySelectorAll('[data-drawer-close]').forEach((el) => el.addEventListener('click', close));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
        });
    };

    /* -------------------------
       Smooth scroll
       ------------------------- */
    const initSmoothScroll = () => {
        $$('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', (e) => {
                const href = a.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                const offset = 82;
                const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            });
        });
    };

    /* -------------------------
       Reveal prep
       ------------------------- */
    const applyReveal = () => {
        ['.card', '.achievement-card', '.memory-card', '.content-box', '.reflection-card'].forEach((sel) => {
            $$(sel).forEach((el) => el.classList.add('reveal'));
        });
        $$('.card').forEach((el, i) => el.classList.add(i % 2 === 0 ? 'reveal--left' : 'reveal--right'));
        $$('.achievement-card').forEach((el) => el.classList.add('reveal--scale'));
        $$('.memory-card').forEach((el, i) => el.classList.add(i % 2 === 0 ? 'reveal--left' : 'reveal--right'));
        const stagger = (sel, step = 80) => {
            $$(sel).forEach((el, i) => el.style.setProperty('--reveal-delay', `${Math.min((i % 6) * step, 420)}ms`));
        };
        stagger('.card', 90);
        stagger('.achievement-card', 70);
        stagger('.memory-card', 100);
    };

    const initReveal = () => {
        const els = $$('.reveal');
        if (!els.length) return;
        if (prefersReducedMotion) {
            els.forEach((el) => el.classList.add('active'));
            return;
        }
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('active');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
        els.forEach((el) => io.observe(el));
    };

    const initHeadingReveal = () => {
        const headings = $$('[data-reveal-heading]');
        if (!headings.length) return;
        if (prefersReducedMotion) {
            headings.forEach((h) => h.classList.add('is-visible'));
            return;
        }
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-visible');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.4 });
        headings.forEach((h) => io.observe(h));
    };

    /* -------------------------
       Active nav link
       ------------------------- */
    const initActiveNav = () => {
        const sections = $$('main section[id]');
        const links = $$('.nav-links a[href^="#"]');
        if (!sections.length || !links.length) return;
        const byId = new Map();
        links.forEach((a) => { const id = a.getAttribute('href')?.replace('#', ''); if (id) byId.set(id, a); });
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                const id = e.target.getAttribute('id');
                if (!id) return;
                links.forEach((a) => a.classList.remove('active'));
                byId.get(id)?.classList.add('active');
            });
        }, { threshold: 0.5, rootMargin: '-82px 0px -40% 0px' });
        sections.forEach((s) => io.observe(s));
    };

    /* -------------------------
       Card spotlight
       ------------------------- */
    const initCardSpotlight = () => {
        $$('.card').forEach((card) => {
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width) * 100;
                const y = ((e.clientY - r.top) / r.height) * 100;
                card.style.setProperty('--mx', `${x}%`);
                card.style.setProperty('--my', `${y}%`);
            });
        });
    };

    /* -------------------------
       Memories Carousel
       ------------------------- */
    const initMemories = () => {
        const carousel = $('#memoriesCarousel');
        const track = carousel?.querySelector('[data-memories-track]');
        const prev = carousel?.querySelector('[data-memories-prev]');
        const next = carousel?.querySelector('[data-memories-next]');
        const dotsHost = carousel?.querySelector('[data-memories-dots]');
        if (!carousel || !track) return;
        const cards = $$('.memory-card', track);
        if (!cards.length) return;
        let index = 0, dots = [];
        const isMobileLayout = () => window.innerWidth <= 900;
        const buildDots = () => {
            if (!dotsHost) return;
            dotsHost.innerHTML = '';
            dots = cards.map((_, i) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.setAttribute('aria-label', `Go to memory ${i + 1}`);
                b.addEventListener('click', () => goTo(i));
                dotsHost.appendChild(b);
                return b;
            });
        };
        const update = () => {
            dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
            if (prev) prev.disabled = index === 0;
            if (next) next.disabled = index === cards.length - 1;
            if (isMobileLayout()) {
                cards.forEach((c, i) => (c.style.display = i === index ? 'block' : 'none'));
            } else {
                cards.forEach((c) => (c.style.display = ''));
            }
        };
        const goTo = (i) => { index = clamp(i, 0, cards.length - 1); update(); };
        prev?.addEventListener('click', () => goTo(index - 1));
        next?.addEventListener('click', () => goTo(index + 1));
        let sX = 0, dx = 0, swiping = false;
        track.addEventListener('touchstart', (e) => {
            if (!isMobileLayout()) return;
            sX = e.touches[0].clientX; swiping = true;
        }, { passive: true });
        track.addEventListener('touchmove', (e) => {
            if (!swiping) return;
            dx = e.touches[0].clientX - sX;
        }, { passive: true });
        track.addEventListener('touchend', () => {
            if (!swiping) return;
            swiping = false;
            if (Math.abs(dx) > 40) (dx < 0 ? goTo(index + 1) : goTo(index - 1));
            dx = 0;
        });
        window.addEventListener('resize', () => {
            if (!isMobileLayout()) cards.forEach((c) => (c.style.display = ''));
            else update();
        });
        buildDots();
        update();
    };

    /* -------------------------
       Lightbox
       ------------------------- */
    const initLightbox = () => {
        const lightbox = $('#lightbox');
        if (!lightbox) return;
        const image = lightbox.querySelector('.lightbox__image');
        const caption = lightbox.querySelector('.lightbox__caption');
        const counter = lightbox.querySelector('.lightbox__counter');
        const stage = lightbox.querySelector('.lightbox__stage');
        const prevBtn = lightbox.querySelector('[data-lightbox-prev]');
        const nextBtn = lightbox.querySelector('[data-lightbox-next]');
        const closeTargets = lightbox.querySelectorAll('[data-lightbox-close]');
        let lastFocus = null, current = 0, zoomed = false;

        const items = $$('[data-zoomable] .certificate-image img').map((img) => {
            const card = img.closest('[data-zoomable]');
            const title = card?.querySelector('.achievement-info h4')?.textContent?.trim() || '';
            const sub = card?.querySelector('.achievement-info p')?.textContent?.trim() || '';
            return { src: img.currentSrc || img.src, alt: img.alt || title, caption: [title, sub].filter(Boolean).join(' — '), rotated: img.classList.contains('cert-fix') };
        });
        const isOpen = () => lightbox.classList.contains('is-open');
        const updateCounter = () => { if (counter) counter.textContent = items.length ? `${current + 1} / ${items.length}` : ''; };
        const setImage = (item) => {
            if (!image || !item) return;
            image.classList.add('is-changing');
            setTimeout(() => {
                image.src = item.src; image.alt = item.alt;
                image.classList.toggle('is-rotated', item.rotated);
                image.classList.add('is-zoomable'); image.classList.remove('is-zoomed');
                zoomed = false;
                if (caption) caption.textContent = item.caption;
                updateCounter();
                image.classList.remove('is-changing');
            }, 180);
        };
        const show = (i) => {
            if (!items.length) return;
            current = (i + items.length) % items.length;
            setImage(items[current]);
            if (prevBtn) prevBtn.style.display = items.length > 1 ? '' : 'none';
            if (nextBtn) nextBtn.style.display = items.length > 1 ? '' : 'none';
        };
        const open = (i) => {
            lastFocus = document.activeElement;
            show(i);
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.classList.add('lightbox-open');
            lightbox.querySelector('.lightbox__close')?.focus();
        };
        const close = () => {
            if (!isOpen()) return;
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('lightbox-open');
            if (image) {
                image.removeAttribute('src');
                image.classList.remove('is-rotated', 'is-zoomed', 'is-zoomable', 'is-changing');
            }
            if (caption) caption.textContent = '';
            if (counter) counter.textContent = '';
            if (lastFocus?.focus) lastFocus.focus();
            lastFocus = null;
        };
        $$('[data-zoomable] .certificate-image img').forEach((img, i) => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => open(i));
        });
        closeTargets.forEach((el) => el.addEventListener('click', close));
        prevBtn?.addEventListener('click', () => show(current - 1));
        nextBtn?.addEventListener('click', () => show(current + 1));
        document.addEventListener('keydown', (e) => {
            if (!isOpen()) return;
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowRight') show(current + 1);
            else if (e.key === 'ArrowLeft') show(current - 1);
        });
        image?.addEventListener('click', (e) => {
            if (!isOpen()) return;
            zoomed = !zoomed;
            const rot = image.classList.contains('is-rotated') ? ' rotate(-90deg)' : '';
            if (zoomed) {
                image.style.transformOrigin = 'center center';
                image.style.transform = `scale(1.8)${rot}`;
                image.classList.add('is-zoomed'); image.classList.remove('is-zoomable');
            } else {
                image.style.transform = rot;
                image.classList.add('is-zoomable'); image.classList.remove('is-zoomed');
            }
        });
        // Swipe
        let sx = 0, sdx = 0, swiping = false;
        stage?.addEventListener('touchstart', (e) => { if (zoomed) return; sx = e.touches[0].clientX; swiping = true; }, { passive: true });
        stage?.addEventListener('touchmove', (e) => { if (!swiping || zoomed) return; sdx = e.touches[0].clientX - sx; }, { passive: true });
        stage?.addEventListener('touchend', () => {
            if (!swiping || zoomed) return;
            swiping = false;
            if (Math.abs(sdx) > 50) (sdx < 0 ? show(current + 1) : show(current - 1));
            sdx = 0;
        });
    };

    /* -------------------------
       Certificate Hover Preview
       ------------------------- */
    const initCertPreview = () => {
        if (isTouch || prefersReducedMotion) return;
        const preview = $('#certPreview');
        const img = $('#certPreviewImg');
        if (!preview || !img) return;
        const cards = $$('[data-zoomable]');
        cards.forEach((card) => {
            const cimg = card.querySelector('.certificate-image img');
            if (!cimg) return;
            card.addEventListener('mouseenter', (e) => {
                img.src = cimg.currentSrc || cimg.src;
                img.alt = cimg.alt || '';
                preview.classList.toggle('is-rotated', cimg.classList.contains('cert-fix'));
                preview.classList.add('is-visible');
            });
            card.addEventListener('mousemove', (e) => {
                const x = e.clientX;
                const y = e.clientY;
                preview.style.left = `${x}px`;
                preview.style.top = `${y}px`;
            });
            card.addEventListener('mouseleave', () => preview.classList.remove('is-visible'));
        });
    };

    /* -------------------------
       Hero Title Scramble
       ------------------------- */
    const initTitleScramble = () => {
        const title = document.querySelector('.main-title[data-scramble]');
        if (!title) return;
        if (prefersReducedMotion) return;
        const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*';
        const original = 'DARSHIL SINGH';
        let timer = null;
        let isScrambling = false;

        const scramble = () => {
            if (isScrambling) return;
            isScrambling = true;
            title.classList.add('is-scrambling');
            const spans = $$('.char', title);
            let iter = 0;
            const total = 18;
            timer = setInterval(() => {
                spans.forEach((s, i) => {
                    if (i < iter / 2) {
                        s.textContent = original[i] || ' ';
                    } else {
                        s.textContent = CHARS[randi(0, CHARS.length - 1)];
                    }
                });
                iter++;
                if (iter >= total) {
                    clearInterval(timer);
                    spans.forEach((s, i) => (s.textContent = original[i] || ' '));
                    title.classList.remove('is-scrambling');
                    isScrambling = false;
                }
            }, 35);
        };

        title.addEventListener('mouseenter', scramble);
    };

    /* -------------------------
       Hero text split (chars)
       ------------------------- */
    const initTextSplit = () => {
        const targets = $$('[data-split]');
        if (!targets.length) return;
        if (prefersReducedMotion) return;
        targets.forEach((el) => {
            const text = el.textContent.trim();
            el.setAttribute('aria-label', text);
            el.textContent = '';
            const frag = document.createDocumentFragment();
            [...text].forEach((c) => {
                const s = document.createElement('span');
                s.className = 'char';
                s.textContent = c === ' ' ? '\u00A0' : c;
                frag.appendChild(s);
            });
            el.appendChild(frag);
        });
    };

    /* -------------------------
       GSAP reveal
       ------------------------- */
    const initGsap = () => {
        const hasGsap = !prefersReducedMotion && typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
        if (!hasGsap) return false;
        const gsap = window.gsap;
        gsap.registerPlugin(window.ScrollTrigger);
        document.documentElement.classList.add('use-gsap');

        const hero = $('.hero-content');
        if (hero) {
            gsap.fromTo(hero, { autoAlpha: 0, y: 18, filter: 'blur(12px)' },
                { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' });
        }
        const heroTargets = ['.subtitle', '.main-title', '.tagline', '.hero-quote', '.school-info', '.hero__cta'];
        gsap.fromTo(heroTargets, { autoAlpha: 0, y: 22, filter: 'blur(8px)' },
            { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out', stagger: 0.12, delay: 0.2 });

        const chars = $$('.main-title .char');
        if (chars.length) {
            gsap.fromTo(chars, { autoAlpha: 0, y: 30, rotateX: -60 },
                { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.8, ease: 'power3.out', stagger: 0.035, delay: 0.1 });
        }

        const revealEls = $$('.reveal').filter((el) => !el.closest('#home'));
        revealEls.forEach((el) => {
            const style = getComputedStyle(el);
            const raw = style.getPropertyValue('--reveal-delay').trim();
            const ms = raw.endsWith('ms') ? parseFloat(raw) : parseFloat(raw) * 1000;
            const delay = Number.isFinite(ms) ? ms / 1000 : 0;
            const from = { autoAlpha: 0, x: 0, y: 28, scale: 1, filter: 'blur(10px)' };
            if (el.classList.contains('reveal--left')) { from.x = -42; from.y = 0; }
            else if (el.classList.contains('reveal--right')) { from.x = 42; from.y = 0; }
            else if (el.classList.contains('reveal--scale')) { from.scale = 0.94; from.y = 0; }
            gsap.fromTo(el, from, {
                autoAlpha: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)',
                duration: 0.95, ease: 'power3.out', delay,
                scrollTrigger: { trigger: el, start: 'top 86%', once: true }
            });
        });

        $$('[data-reveal-heading]').forEach((el) => {
            if (el.dataset.splitDone) return;
            el.dataset.splitDone = '1';
            const text = el.textContent;
            el.innerHTML = '';
            const chars = [...text].map((c) => {
                const s = document.createElement('span');
                s.className = 'char-wrap';
                const inner = document.createElement('span');
                inner.className = 'char';
                inner.textContent = c === ' ' ? '\u00A0' : c;
                s.appendChild(inner);
                el.appendChild(s);
                return inner;
            });
            gsap.fromTo(chars, { yPercent: 110 }, {
                yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.03,
                scrollTrigger: { trigger: el, start: 'top 80%', once: true }
            });
        });
        return true;
    };

    /* -------------------------
       Theme init
       ------------------------- */
    const initTheme = () => {
        const saved = localStorage.getItem(STORAGE_THEME);
        if (saved) document.body.setAttribute('data-theme', saved);
    };

    /* -------------------------
       Konami Easter Egg
       ------------------------- */
    const initEasterEgg = () => {
        if (prefersReducedMotion) return;
        const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
        let pos = 0;
        document.addEventListener('keydown', (e) => {
            const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            if (k === code[pos]) {
                pos++;
                if (pos === code.length) {
                    pos = 0;
                    const on = !document.body.classList.contains('party-mode');
                    document.body.classList.toggle('party-mode', on);
                    showToast(`Party mode: ${on ? 'ON' : 'OFF'}`, 'party-horn');
                    Sound.success();
                    if (on && typeof window.confetti === 'function') {
                        for (let i = 0; i < 3; i++) {
                            setTimeout(() => {
                                window.confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
                            }, i * 300);
                        }
                    }
                }
            } else {
                pos = k === code[0] ? 1 : 0;
            }
        });
    };

    /* -------------------------
       CV Download — generates a styled, print-ready HTML CV
       ------------------------- */
    const buildCVHtml = () => {
        const theme = document.body.getAttribute('data-theme') || 'aurora';
        const themeColors = {
            aurora: ['#6ee7ff', '#a78bfa'],
            sunset: ['#fb923c', '#f472b6'],
            forest: ['#34d399', '#22d3ee'],
            cosmic: ['#f472b6', '#c084fc']
        }[theme] || ['#6ee7ff', '#a78bfa'];
        const a1 = themeColors[0], a2 = themeColors[1];
        const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Darshil Singh — Curriculum Vitae</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    color: #1a2230;
    background: #fff;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  .page {
    max-width: 820px;
    margin: 0 auto;
    padding: 48px 56px;
    background: #fff;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    padding-bottom: 22px;
    border-bottom: 3px solid ${a1};
    margin-bottom: 28px;
  }
  .name {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 40px;
    font-weight: 700;
    margin: 0 0 4px;
    letter-spacing: -0.5px;
    color: #0b1424;
    background: linear-gradient(90deg, ${a1}, ${a2});
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .role { font-size: 14px; color: #4b5563; margin: 0; letter-spacing: 1px; text-transform: uppercase; font-weight: 600; }
  .meta { text-align: right; font-size: 12.5px; color: #4b5563; line-height: 1.7; }
  .meta strong { color: #0b1424; display: block; margin-top: 2px; }
  .grad-bar {
    height: 4px;
    background: linear-gradient(90deg, ${a1}, ${a2});
    border-radius: 2px;
    margin: 18px 0 24px;
  }
  .section { margin-bottom: 22px; page-break-inside: avoid; }
  .section h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 16px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 0 0 10px;
    padding-bottom: 6px;
    border-bottom: 1.5px solid ${a1};
    color: #0b1424;
  }
  .summary p { margin: 0 0 10px; color: #374151; font-size: 14px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
  .item { margin-bottom: 14px; }
  .item-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .item-title { font-weight: 700; font-size: 14.5px; color: #0b1424; }
  .item-sub { font-size: 13px; color: #4b5563; font-style: italic; }
  .item-date { font-size: 12px; color: #6b7280; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .item ul { margin: 6px 0 0 18px; padding: 0; }
  .item li { font-size: 13px; color: #374151; margin-bottom: 3px; }
  .pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    background: linear-gradient(90deg, ${a1}22, ${a2}22);
    border: 1px solid ${a1}66;
    color: #0b1424;
    font-size: 11.5px;
    font-weight: 600;
    margin: 0 6px 6px 0;
  }
  .achv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .achv {
    border: 1px solid #e5e7eb;
    border-left: 3px solid ${a1};
    padding: 10px 12px;
    border-radius: 4px;
    background: #fafbfd;
  }
  .achv strong { display: block; font-size: 13px; color: #0b1424; }
  .achv span { font-size: 12px; color: #4b5563; }
  .footer {
    margin-top: 30px;
    padding-top: 14px;
    border-top: 1px solid #e5e7eb;
    font-size: 11.5px;
    color: #6b7280;
    text-align: center;
  }
  @media print {
    body { background: #fff; }
    .page { padding: 24px 30px; max-width: 100%; }
    .section { page-break-inside: avoid; }
    .achv { page-break-inside: avoid; }
  }
  @media (max-width: 600px) {
    .page { padding: 28px 22px; }
    .header { flex-direction: column; }
    .meta { text-align: left; }
    .grid-2, .achv-grid { grid-template-columns: 1fr; }
    .name { font-size: 32px; }
  }
</style>
</head>
<body>
<div class="page">
  <header class="header">
    <div>
      <h1 class="name">Darshil Singh</h1>
      <p class="role">Class X Student · Aspiring Problem Solver</p>
    </div>
    <div class="meta">
      <strong>Contact</strong>
      darshilsingh37@gmail.com<br>
      github.com/darshilsingh37-commits<br>
      <strong>Location</strong>
      Gayatri Public School<br>
      Class X-B · 2026–27
    </div>
  </header>
  <div class="grad-bar"></div>

  <section class="section summary">
    <h2>Profile</h2>
    <p>Curious Class X student with a strong interest in Physics, Chemistry, and Mathematics. Enjoys understanding how scientific principles explain real-life phenomena and likes solving logical problems. Believes in continuous self-improvement and aims to develop creativity and problem-solving skills to make a positive impact.</p>
  </section>

  <section class="section">
    <h2>Education</h2>
    <div class="item">
      <div class="item-head">
        <div>
          <div class="item-title">Gayatri Public School</div>
          <div class="item-sub">Class X-B · Central Board of Secondary Education</div>
        </div>
        <div class="item-date">2026 – 2027</div>
      </div>
      <ul>
        <li>Active in Science Olympiads, interschool quizzes, and Sanskriti Gyan Pariksha</li>
        <li>Strong academic record with consistent SEA assessments</li>
        <li>Member of the School Cyber Club (Class VIII)</li>
      </ul>
    </div>
  </section>

  <section class="section">
    <h2>Academic Highlights</h2>
    <div class="grid-2">
      <div class="item">
        <div class="item-head"><div class="item-title">Science</div><div class="item-date">Class X</div></div>
        <ul>
          <li>Physics assignments and numerical problems</li>
          <li>Practical and lab activities</li>
          <li>Science project work &amp; SEA assessments</li>
        </ul>
      </div>
      <div class="item">
        <div class="item-head"><div class="item-title">Mathematics</div><div class="item-date">Class X</div></div>
        <ul>
          <li>Class assignments &amp; group theorem-proving</li>
          <li>Graph activities &amp; lab activities</li>
          <li>Multiple SEA assessments</li>
        </ul>
      </div>
      <div class="item">
        <div class="item-head"><div class="item-title">Social Science</div><div class="item-date">Class X</div></div>
        <ul>
          <li>Map work &amp; geography activities</li>
          <li>History assignments &amp; projects</li>
          <li>Civics, economics notes &amp; presentations</li>
        </ul>
      </div>
      <div class="item">
        <div class="item-head"><div class="item-title">English</div><div class="item-date">Class X</div></div>
        <ul>
          <li>Creative writing, essays &amp; poems</li>
          <li>Grammar projects &amp; presentations</li>
          <li>Reading activities</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="section">
    <h2>Achievements</h2>
    <div class="achv-grid">
      <div class="achv"><strong>National Science Olympiad (NSO)</strong><span>Participated · 2022</span></div>
      <div class="achv"><strong>National Science Olympiad (NSO)</strong><span>School Rank 1 · 2024</span></div>
      <div class="achv"><strong>Interschool Science Quiz</strong><span>2nd Prize</span></div>
      <div class="achv"><strong>Sanskriti Gyan Pariksha</strong><span>1st Prize</span></div>
      <div class="achv"><strong>Sanskriti Gyan Pariksha</strong><span>2nd Prize</span></div>
      <div class="achv"><strong>Sanskriti Gyan Pariksha</strong><span>3rd Prize</span></div>
    </div>
  </section>

  <section class="section">
    <h2>Co-Curricular Activities</h2>
    <div class="item">
      <div class="item-head"><div class="item-title">School Cyber Club</div><div class="item-date">Class VIII</div></div>
      <ul>
        <li>Explored technology-related activities</li>
        <li>Improved digital awareness and problem-solving skills</li>
      </ul>
    </div>
    <div class="item">
      <div class="item-head"><div class="item-title">School Assembly Presentations</div><div class="item-date">Classes VI – VII</div></div>
      <ul>
        <li>Built confidence in public speaking and stage presence</li>
        <li>Learned discipline, coordination, and active participation</li>
      </ul>
    </div>
  </section>

  <section class="section">
    <h2>Skills &amp; Interests</h2>
    <div>
      <span class="pill">Physics</span><span class="pill">Chemistry</span><span class="pill">Mathematics</span>
      <span class="pill">Logical Reasoning</span><span class="pill">Problem Solving</span>
      <span class="pill">Public Speaking</span><span class="pill">Reading</span>
      <span class="pill">Swimming</span><span class="pill">Manga</span><span class="pill">Psychological Thrillers</span>
    </div>
  </section>

  <section class="section">
    <h2>Strengths &amp; Goals</h2>
    <p style="margin:0 0 8px;color:#374151;font-size:13.5px"><strong style="color:#0b1424">Strengths:</strong> Dedication to studies, logical thinking, in-depth understanding of concepts, discipline, and focus.</p>
    <p style="margin:0;color:#374151;font-size:13.5px"><strong style="color:#0b1424">Goals:</strong> Continue learning, build communication &amp; teamwork skills, and grow into a knowledgeable, responsible individual who can contribute positively to society.</p>
  </section>

  <div class="footer">
    Generated from Darshil Singh's online portfolio · ${today}
  </div>
</div>
</body>
</html>`;
    };

    const downloadCV = () => {
        try {
            const html = buildCVHtml();
            const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Darshil_Singh_CV.html';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                a.remove();
                URL.revokeObjectURL(url);
            }, 100);
            showToast('CV downloaded — open & print to PDF', 'file-arrow-down');
            Sound.success();
        } catch (e) {
            showToast('Could not generate CV', 'circle-exclamation');
        }
    };

    /* -------------------------
       Contact Modal
       ------------------------- */
    const openContact = () => {
        const m = $('#contactModal');
        if (!m) return;
        m.classList.add('is-open');
        m.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        Sound.pop();
    };
    const closeContact = () => {
        const m = $('#contactModal');
        if (!m || !m.classList.contains('is-open')) return;
        m.classList.remove('is-open');
        m.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    const initContactModal = () => {
        const m = $('#contactModal');
        if (!m) return;
        m.querySelectorAll('[data-contact-close]').forEach((el) => el.addEventListener('click', closeContact));
        // Contact-card spotlight (mirror of card spotlight)
        $$('.contact-card').forEach((card) => {
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width) * 100;
                const y = ((e.clientY - r.top) / r.height) * 100;
                card.style.setProperty('--mx', `${x}%`);
                card.style.setProperty('--my', `${y}%`);
            });
        });
        // Copy URL
        const copyBtn = $('#copyUrlBtn');
        copyBtn?.addEventListener('click', async () => {
            const url = window.location.href;
            try {
                await navigator.clipboard.writeText(url);
                showToast('Page URL copied to clipboard', 'clipboard-check');
                Sound.success();
            } catch (e) {
                // Fallback
                const ta = document.createElement('textarea');
                ta.value = url;
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); showToast('Page URL copied', 'clipboard-check'); }
                catch (_) { showToast('Copy failed — please copy manually', 'circle-exclamation'); }
                ta.remove();
            }
        });
    };

    const initHeroContactBtn = () => {
        const btn = $('#heroContactBtn');
        btn?.addEventListener('click', openContact);
    };

    /* -------------------------
       Keyboard Shortcuts Panel
       ------------------------- */
    const openShortcuts = () => {
        const p = $('#shortcuts');
        if (!p) return;
        p.classList.add('is-open');
        p.setAttribute('aria-hidden', 'false');
        Sound.pop();
    };
    const closeShortcuts = () => {
        const p = $('#shortcuts');
        if (!p || !p.classList.contains('is-open')) return;
        p.classList.remove('is-open');
        p.setAttribute('aria-hidden', 'true');
    };

    const initKeyboardShortcuts = () => {
        const panel = $('#shortcuts');
        if (!panel) return;
        panel.querySelectorAll('[data-shortcuts-close]').forEach((el) => el.addEventListener('click', closeShortcuts));

        const handle = (e) => {
            // Ignore when typing in inputs / contenteditable
            const tgt = e.target;
            if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) return;
            // Esc closes any panel
            if (e.key === 'Escape') {
                closeShortcuts();
                closeContact();
                return;
            }
            // ? toggles the panel (Shift+/ on most keyboards)
            if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
                e.preventDefault();
                panel.classList.contains('is-open') ? closeShortcuts() : openShortcuts();
                return;
            }
            // Other shortcuts work when no panel is open (avoid stealing Esc/Enter)
            if (panel.classList.contains('is-open') || $('#contactModal')?.classList.contains('is-open')) return;
            const k = e.key.toLowerCase();
            if (k === 't') { e.preventDefault(); $('#themeBtn')?.click(); }
            else if (k === 's') { e.preventDefault(); $('#soundBtn')?.click(); }
            else if (k === 'd') { e.preventDefault(); downloadCV(); }
            else if (k === 'c') { e.preventDefault(); openContact(); }
            else if (k === 'h') { e.preventDefault(); window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }); }
            else if (k === 'g') { e.preventDefault(); $('#sectionNav')?.classList.toggle('is-hidden'); }
        };
        document.addEventListener('keydown', handle);
    };

    const initKbdHint = () => {
        const btn = $('#kbdHint');
        btn?.addEventListener('click', openShortcuts);
    };

    /* -------------------------
       Shake to celebrate (mobile easter egg — keeps the confetti fun)
       ------------------------- */
    const initShakeCelebrate = () => {
        if (prefersReducedMotion) return;
        let lastX = 0, lastY = 0, lastZ = 0;
        let lastTime = 0;
        let shakeCount = 0;
        let lastShakeAt = 0;
        let hintShown = false;

        const showHint = () => {
            if (hintShown) return;
            hintShown = true;
            const t = document.createElement('div');
            t.className = 'shake-pulse';
            t.innerHTML = '<i class="fas fa-mobile-screen"></i>&nbsp; Shake to celebrate!';
            document.body.appendChild(t);
            setTimeout(() => t.remove(), 1800);
        };

        const handler = (e) => {
            const a = e.accelerationIncludingGravity;
            if (!a) return;
            const now = Date.now();
            if (now - lastTime < 80) return;
            lastTime = now;
            const speed = Math.abs(a.x - lastX) + Math.abs(a.y - lastY) + Math.abs(a.z - lastZ);
            lastX = a.x; lastY = a.y; lastZ = a.z;
            if (speed > 28) {
                if (now - lastShakeAt > 900) shakeCount = 0;
                shakeCount++;
                lastShakeAt = now;
                if (shakeCount === 1) showHint();
                if (shakeCount >= 3) {
                    shakeCount = 0;
                    if (typeof window.confetti === 'function') {
                        const colors = ['#6ee7ff', '#a78bfa', '#22c55e', '#f472b6', '#facc15'];
                        const burst = (i) => window.confetti({
                            particleCount: 90, spread: 80, startVelocity: 45,
                            origin: { x: 0.2 + i * 0.3, y: 0.6 }, colors
                        });
                        burst(0); burst(1); burst(2);
                    }
                    Sound.success();
                    showToast('Shake shake! 🎉', 'party-horn');
                    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
                }
            }
        };

        // Only enable on touch devices
        if (!isTouch) return;
        // iOS 13+ requires permission
        const req = () => {
            try {
                if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                    DeviceMotionEvent.requestPermission().then((s) => {
                        if (s === 'granted') window.addEventListener('devicemotion', handler, { passive: true });
                    }).catch(() => {});
                } else if (typeof DeviceMotionEvent !== 'undefined') {
                    window.addEventListener('devicemotion', handler, { passive: true });
                }
            } catch (_) {}
        };
        // Attach on first user interaction to satisfy iOS
        const attach = () => {
            req();
            window.removeEventListener('touchstart', attach);
            window.removeEventListener('click', attach);
        };
        window.addEventListener('touchstart', attach, { once: true, passive: true });
        window.addEventListener('click', attach, { once: true });
    };

    /* -------------------------
       Active section in mobile drawer
       ------------------------- */
    const initDrawerActiveSection = () => {
        const links = $$('.drawer__link');
        if (!links.length) return;
        const sections = $$('main section[id]');
        const byHref = new Map();
        links.forEach((a) => {
            const id = a.getAttribute('href')?.replace('#', '');
            if (id) byHref.set(id, a);
        });
        const setActive = (id) => {
            links.forEach((a) => a.classList.remove('is-active'));
            byHref.get(id)?.classList.add('is-active');
        };
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) setActive(e.target.id);
            });
        }, { threshold: 0.4, rootMargin: '-82px 0px -40% 0px' });
        sections.forEach((s) => io.observe(s));
    };

    /* -------------------------
       Swipe up at the bottom of the page → scroll to top (mobile)
       ------------------------- */
    const initSwipeToTop = () => {
        if (!isTouch) return;
        let startY = 0, startX = 0, startT = 0, tracking = false;
        const SWIPE_MIN = 90;
        const SWIPE_MAX_X = 80;
        const SWIPE_MAX_TIME = 600;

        // Build indicator once
        const indicator = document.createElement('div');
        indicator.className = 'swipe-indicator';
        indicator.innerHTML = '<i class="fas fa-hand-point-up"></i> Swipe up to top';
        document.body.appendChild(indicator);

        let indicatorShown = false;
        const checkScroll = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const p = max > 0 ? (window.scrollY / max) : 0;
            const shouldShow = p > 0.55;
            if (shouldShow && !indicatorShown) {
                indicator.classList.add('is-visible');
                indicatorShown = true;
            } else if (!shouldShow && indicatorShown) {
                indicator.classList.remove('is-visible');
                indicatorShown = false;
            }
        };
        window.addEventListener('scroll', checkScroll, { passive: true });
        checkScroll();

        const onStart = (e) => {
            const t = e.touches[0];
            startY = t.clientY;
            startX = t.clientX;
            startT = Date.now();
            tracking = (window.innerHeight - startY) < 160; // near the bottom
        };
        const onEnd = (e) => {
            if (!tracking) return;
            tracking = false;
            const t = (e.changedTouches && e.changedTouches[0]) || null;
            if (!t) return;
            const dy = startY - t.clientY; // up = positive
            const dx = Math.abs(t.clientX - startX);
            const dt = Date.now() - startT;
            if (dy > SWIPE_MIN && dx < SWIPE_MAX_X && dt < SWIPE_MAX_TIME) {
                window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                if (navigator.vibrate) navigator.vibrate(15);
                showToast('Back to top', 'arrow-up');
                indicator.classList.remove('is-visible');
                indicatorShown = false;
            }
        };
        window.addEventListener('touchstart', onStart, { passive: true });
        window.addEventListener('touchend', onEnd, { passive: true });
    };

    /* -------------------------
       Cursor Style Picker (PC only)
       Lets the user switch between 6 cursor styles.
       Persists choice in localStorage and applies it to
       body[data-cursor-style] which all the CSS variants key off of.
       Hidden on touch via CSS; also guarded in JS.
       ------------------------- */
    const CURSOR_STYLES = ['classic', 'glitch', 'aurora', 'neon', 'minimal', 'liquid'];
    const CURSOR_STYLE_LABELS = {
        classic: 'Classic',
        glitch:  'Glitch',
        aurora:  'Aurora',
        neon:    'Neon',
        minimal: 'Minimal',
        liquid:  'Liquid'
    };
    const CURSOR_STYLE_KEY = 'pf-cursor-style';

    const initCursorPicker = () => {
        // PC-only: bail on touch / coarse pointer
        if (isTouch || !isFinePointer) return;

        const btn = $('#cursorStyleBtn');
        const picker = $('#cursorPicker');
        const grid = $('#cursorPickerGrid');
        if (!btn || !picker || !grid) return;

        // Apply stored style (or default to classic)
        const stored = (() => {
            try { return localStorage.getItem(CURSOR_STYLE_KEY) || 'classic'; }
            catch (_) { return 'classic'; }
        })();
        const applyStyle = (style) => {
            if (!CURSOR_STYLES.includes(style)) style = 'classic';
            document.body.dataset.cursorStyle = style;
            try { localStorage.setItem(CURSOR_STYLE_KEY, style); } catch (_) { /* ignore */ }
            // Mark active button
            grid.querySelectorAll('.cursor-style').forEach((b) => {
                b.classList.toggle('is-active', b.dataset.style === style);
                b.setAttribute('aria-pressed', b.dataset.style === style ? 'true' : 'false');
            });
            // Show a tiny confirmation toast
            if (typeof showToast === 'function') {
                showToast(`Cursor: ${CURSOR_STYLE_LABELS[style] || style}`, 'arrow-pointer');
            }
        };
        applyStyle(stored);

        const open = () => {
            picker.hidden = false;
            requestAnimationFrame(() => picker.classList.add('is-open'));
            btn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        };
        const close = () => {
            picker.classList.remove('is-open');
            setTimeout(() => { picker.hidden = true; }, 350);
            btn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        };

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (picker.hidden) open(); else close();
        });
        picker.addEventListener('click', (e) => {
            if (e.target.closest('[data-cursor-picker-close]')) close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !picker.hidden) close();
        });

        // Wire each style option
        grid.querySelectorAll('.cursor-style').forEach((b) => {
            b.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const style = b.dataset.style;
                applyStyle(style);
                // Tiny visual feedback
                Sound.click && Sound.click();
                setTimeout(close, 220);
            });
        });
    };

    /* -------------------------
       Init
       ------------------------- */
    onReady(() => {
        initPreloader();
        initBgVideo();
        initTheme();
        initTextSplit();
        initClock();
        initNav();
        initDock();
        initDrawer();
        initSmoothScroll();
        applyReveal();
        initActiveNav();
        initCardSpotlight();
        initHeadingReveal();
        initMemories();
        initLightbox();
        initRipples();
        initCertPreview();
        initTitleScramble();
        initCursor();
        initCursorPicker();
        initParticles();
        initTilt();
        initMagnetic();
        initFloaterParallax();
        initEasterEgg();
        initSectionNav();
        initContactModal();
        initKeyboardShortcuts();
        initShakeCelebrate();
        initDrawerActiveSection();
        initSwipeToTop();
        initKbdHint();
        initHeroContactBtn();

        if (!initGsap()) initReveal();
    });
})();
