/* =========================================
   Darshil Singh — Portfolio v5 (Redesign)
   3D/4D/5D Animations + Easter Eggs
   ========================================= */

// ---------- Device capability (declare EARLY so heavy systems can gate) ----------
const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowCores = (navigator.hardwareConcurrency || 4) < 4;
const isLowPower = isTouch || lowCores || reduceMotion;

// ---------- Preloader (handled by inline CSS animation; JS only as backup) ----------
const preloader = document.getElementById('preloader');
const preloaderSkip = document.getElementById('preloaderSkip');

const forceFinish = () => {
  if (preloader) { preloader.classList.add('is-done'); setTimeout(() => { if (preloader.parentNode) preloader.parentNode.removeChild(preloader); }, 600); }
};
if (preloader) setTimeout(forceFinish, 800);
if (preloaderSkip) preloaderSkip.addEventListener('click', forceFinish);

// ---------- Three.js loader ----------
const waitForThree = (cb, timeout = 6000) => {
  const start = Date.now();
  (function poll() {
    if (window.THREE) return cb(window.THREE);
    if (Date.now() - start > timeout) return;
    requestAnimationFrame(poll);
  })();
};

// ---------- Sound (Web Audio) ----------
let soundOn = false;
let audioCtx = null;
const soundBtn = document.getElementById('soundBtn');
const soundOnIcon = document.getElementById('soundOn');
const soundOffIcon = document.getElementById('soundOff');

const ensureAudio = () => {
  if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; } }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

const beep = (freq = 660, dur = 0.08, type = 'sine', vol = 0.06) => {
  if (!soundOn) return;
  const ctx = ensureAudio(); if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type; osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + dur + 0.02);
};

const setSound = (on) => {
  soundOn = on;
  if (soundOn) { ensureAudio(); beep(880, 0.05, 'sine', 0.05); }
  if (soundOnIcon) soundOnIcon.style.display = on ? '' : 'none';
  if (soundOffIcon) soundOffIcon.style.display = on ? 'none' : '';
  if (soundBtn) soundBtn.setAttribute('aria-pressed', String(on));
};
const toggleSound = () => setSound(!soundOn);
if (soundBtn) soundBtn.addEventListener('click', toggleSound);

// ---------- Theme (light/dark) ----------
const themeBtn = document.getElementById('themeBtn');
const themes = ['light', 'dark'];
let themeIdx = 0;
const storedTheme = localStorage.getItem('ds-theme');
if (storedTheme && themes.includes(storedTheme)) {
  themeIdx = themes.indexOf(storedTheme);
  document.documentElement.setAttribute('data-theme', storedTheme);
}
const cycleTheme = () => {
  themeIdx = (themeIdx + 1) % themes.length;
  document.documentElement.setAttribute('data-theme', themes[themeIdx]);
  localStorage.setItem('ds-theme', themes[themeIdx]);
  beep(540, 0.07, 'triangle', 0.05);
  showToast('Theme: ' + themes[themeIdx]);
};
if (themeBtn) themeBtn.addEventListener('click', cycleTheme);

// ---------- Toast ----------
const toast = document.getElementById('toast');
let toastTimer = null;
const showToast = (msg) => {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
};

// ---------- Cursor ----------
const cursor = document.getElementById('cursor');
const cursorLabel = document.getElementById('cursorLabel');
let cursorX = window.innerWidth / 2, cursorY = window.innerHeight / 2;
window.addEventListener('mousemove', (e) => {
  cursorX += (e.clientX - cursorX) * 0.25; cursorY += (e.clientY - cursorY) * 0.25;
  if (cursor) cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
});
window.addEventListener('mousedown', () => cursor && cursor.classList.add('is-active'));
window.addEventListener('mouseup', () => cursor && cursor.classList.remove('is-active'));

const updateCursor = (target) => {
  if (!cursor) return;
  const isHover = target.closest && target.closest('a, button, input, textarea, [data-tilt]');
  cursor.classList.toggle('is-hover', !!isHover);
  const el = target.closest && target.closest('[data-cursor]');
  const label = el && el.getAttribute('data-cursor');
  if (label) { cursorLabel.textContent = label; cursor.classList.add('is-label'); }
  else { cursor.classList.remove('is-label'); }
};
document.addEventListener('mouseover', (e) => updateCursor(e.target));
document.addEventListener('mouseout', () => cursor && cursor.classList.remove('is-label'));

// =========================================
// 4D BACKGROUND LAYERS (alive, multi-layer)
// =========================================

// Layer 1: Animated background orbs (large blurred circles) — DESKTOP ONLY
const initBgOrbs = () => {
  if (isLowPower) return; // skip on touch / low-power / reduced-motion
  if (document.getElementById('bgOrbs')) return;
  const wrap = document.createElement('div');
  wrap.id = 'bgOrbs';
  wrap.className = 'bg-orbs';
  for (let i = 0; i < 4; i++) {
    const o = document.createElement('div');
    o.className = 'bg-orbs__o';
    wrap.appendChild(o);
  }
  document.body.insertBefore(wrap, document.body.firstChild);
};
initBgOrbs();

// Layer 1b: Perspective grid — DESKTOP ONLY
const initBgGrid = () => {
  if (isLowPower) return;
  if (document.getElementById('bgGrid')) return;
  const wrap = document.createElement('div');
  wrap.id = 'bgGrid';
  wrap.className = 'bg-grid';
  const inner = document.createElement('div');
  inner.className = 'bg-grid__inner';
  wrap.appendChild(inner);
  document.body.insertBefore(wrap, document.body.firstChild);
};
initBgGrid();

// Layer 1c: Dot matrix overlay — DESKTOP ONLY
const initBgDots = () => {
  if (isLowPower) return;
  if (document.getElementById('bgDots')) return;
  const wrap = document.createElement('div');
  wrap.id = 'bgDots';
  wrap.className = 'bg-dots';
  document.body.insertBefore(wrap, document.body.firstChild);
};
initBgDots();

// Layer 1d: Floating geometric shapes — DESKTOP ONLY (mobile uses reduced set via CSS)
const initBgShapes = () => {
  if (isLowPower) return;
  if (document.getElementById('bgShapes')) return;
  const wrap = document.createElement('div');
  wrap.id = 'bgShapes';
  wrap.className = 'bg-shapes';
  for (let i = 1; i <= 8; i++) {
    const s = document.createElement('div');
    s.className = `bg-shapes__s bg-shapes__s--${i}`;
    wrap.appendChild(s);
  }
  document.body.insertBefore(wrap, document.body.firstChild);
};
initBgShapes();

// Layer 1e: Vertical light beam — DESKTOP ONLY
const initBgBeam = () => {
  if (isLowPower) return;
  if (document.getElementById('bgBeam')) return;
  const b = document.createElement('div');
  b.id = 'bgBeam';
  b.className = 'bg-beam';
  document.body.insertBefore(b, document.body.firstChild);
};
initBgBeam();

// Layer 1f: Mouse-following light spot — DESKTOP ONLY (touch has no mouse)
const initBgLight = () => {
  if (isLowPower) return;
  if (document.getElementById('bgLight')) return;
  const l = document.createElement('div');
  l.id = 'bgLight';
  l.className = 'bg-light';
  Object.assign(l.style, { left: '50%', top: '50%', opacity: '0' });
  document.body.appendChild(l);
  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  let curX = tx, curY = ty;
  window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; l.style.opacity = '1'; });
  window.addEventListener('mouseleave', () => { l.style.opacity = '0'; });
  const tick = () => {
    curX += (tx - curX) * 0.08; curY += (ty - curY) * 0.08;
    l.style.left = curX + 'px'; l.style.top = curY + 'px';
    requestAnimationFrame(tick);
  };
  tick();
};
initBgLight();

// Layer 2: Three.js particle field — DESKTOP ONLY (skip on touch)
const initBg3D = () => {
  if (isTouch) return; // heavy on mobile GPUs
  if (!window.THREE) return;
  const THREE = window.THREE;

  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', zIndex: '0', pointerEvents: 'none', opacity: isLowPower ? '0.2' : '0.4' });
  document.body.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isLowPower, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowPower ? 1 : 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.z = 25;

  const partCount = isLowPower ? 250 : 600;
  const partGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(partCount * 3);
  const velocities = new Float32Array(partCount * 3);
  for (let i = 0; i < partCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 100;
    positions[i*3+1] = (Math.random() - 0.5) * 100;
    positions[i*3+2] = (Math.random() - 0.5) * 100;
    velocities[i*3] = (Math.random() - 0.5) * 0.002;
    velocities[i*3+1] = (Math.random() - 0.5) * 0.002;
    velocities[i*3+2] = (Math.random() - 0.5) * 0.002;
  }
  partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const partMat = new THREE.PointsMaterial({ size: 0.08, color: 0x8b6f47, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending });
  const particles = new THREE.Points(partGeo, partMat);
  scene.add(particles);

  // Connecting lines (desktop only)
  let lines = null;
  if (!isLowPower) {
    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x2c5f5d, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending });
    const lineSegs = new Float32Array(partCount * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(lineSegs, 3));
    lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);
  }

  let mx = 0, my = 0;
  let localScrollY = 0;
  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  window.addEventListener('scroll', () => { localScrollY = window.scrollY; }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();
  const tick = () => {
    const t = clock.getElapsedTime();
    const pos = partGeo.attributes.position.array;
    for (let i = 0; i < partCount; i++) {
      pos[i*3] += Math.sin(t * 0.3 + i) * 0.005;
      pos[i*3+1] += Math.cos(t * 0.4 + i) * 0.005;
    }
    partGeo.attributes.position.needsUpdate = true;
    particles.rotation.y = t * 0.04 + localScrollY * 0.0003;
    particles.rotation.x = t * 0.018 + localScrollY * 0.0001;
    camera.position.x += (mx * 2.5 - camera.position.x) * 0.04;
    camera.position.y += (-my * 1.5 - camera.position.y) * 0.04;
    camera.position.z = 25 - localScrollY * 0.005;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  tick();
};

waitForThree(() => { try { initBg3D(); } catch (e) { console.warn('3D bg failed', e); } });

// =========================================
// SCROLL PROGRESS BAR
// =========================================
const initScrollProgress = () => {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
};
initScrollProgress();

// =========================================
// SCROLL-REVEAL OBSERVER (4D/5D entrance)
// =========================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('is-in');
      revealObserver.unobserve(en.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate, .stagger, .section__title, .txt-reveal')
  .forEach(el => revealObserver.observe(el));

// =========================================
// PARALLAX (decorative SVGs + hero chair)
// =========================================
const parallaxEls = [
  { el: document.querySelector('.hero__chair'), speed: 0.18, axis: 'y' },
  { el: document.querySelector('.decor--dna'), speed: 0.14, axis: 'y' },
  { el: document.querySelector('.decor--atom'), speed: 0.22, axis: 'xy' },
  { el: document.querySelector('.decor--lightbulb'), speed: 0.16, axis: 'y' },
  { el: document.querySelector('.decor--globe'), speed: 0.12, axis: 'xy' },
  { el: document.querySelector('.decor--hourglass'), speed: 0.2, axis: 'y' },
  { el: document.querySelector('.hero__orb--1'), speed: 0.4, axis: 'y' },
  { el: document.querySelector('.hero__orb--2'), speed: 0.55, axis: 'xy' },
  { el: document.querySelector('.hero__orb--3'), speed: 0.7, axis: 'y' },
].filter(p => p.el);

let scrollY = 0;
let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

const tickParallax = () => {
  parallaxEls.forEach(({ el, speed, axis }) => {
    const ty = -scrollY * speed + mouseY * 18 * speed;
    const tx = mouseX * 18 * speed;
    let t = '';
    if (axis === 'y') t = `translate3d(0, ${ty}px, 0)`;
    else if (axis === 'xy') t = `translate3d(${tx}px, ${ty}px, 0)`;
    el.style.transform = t;
  });
};

// =========================================
// 3D TILT (mouse-reactive, depth-aware) + Shadow Track
// =========================================
const tiltEls = document.querySelectorAll('[data-tilt]');
tiltEls.forEach(el => {
  let raf = null, tx = 0, ty = 0, tz = 0;
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tx = py * -8; ty = px * 10; tz = 12;
    if (!raf) raf = requestAnimationFrame(() => {
      el.style.transform = `perspective(1200px) rotateX(${tx}deg) rotateY(${ty}deg) translateZ(${tz}px)`;
      // 4D shadow tracking tilt direction
      const sx = -ty * 1.5, sy = tx * 1.5;
      el.style.boxShadow = `${sx}px ${sy + 14}px 40px rgba(26, 22, 18, 0.15)`;
      raf = null;
    });
    // 5D cursor proximity
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty('--mx', x + '%');
    el.style.setProperty('--my', y + '%');
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translateZ(0)';
    el.style.boxShadow = '';
  });
});

// =========================================
// SUBTLE 3D TILT on ghost buttons + fields
// =========================================
document.querySelectorAll('.btn--ghost, .field input, .field textarea, .hero__cta .btn').forEach(el => {
  let raf = null;
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    if (!raf) raf = requestAnimationFrame(() => {
      el.style.transform = `perspective(800px) rotateX(${py * -3}deg) rotateY(${px * 4}deg) translateZ(4px)`;
      raf = null;
    });
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

// =========================================
// BACKGROUND VIDEO TOGGLE (mobile-friendly autoplay)
// =========================================
const bgVideo = document.getElementById('bgVideo');
const videoBtn = document.getElementById('videoBtn');
const videoOnIcon = document.getElementById('videoOn');
const videoOffIcon = document.getElementById('videoOff');
let videoOn = localStorage.getItem('ds-video') !== '0'; // default ON
let videoReady = false;

const tryPlay = () => {
  if (!bgVideo || !videoOn) return;
  const p = bgVideo.play();
  if (p && p.catch) {
    p.catch(() => {
      // Autoplay blocked — try again on first user interaction
      const resume = () => {
        if (videoOn && bgVideo) {
          bgVideo.play().catch(() => {});
        }
        document.removeEventListener('touchstart', resume);
        document.removeEventListener('click', resume);
        document.removeEventListener('scroll', resume);
      };
      document.addEventListener('touchstart', resume, { once: true, passive: true });
      document.addEventListener('click', resume, { once: true });
      document.addEventListener('scroll', resume, { once: true, passive: true });
    });
  }
};

if (bgVideo) {
  bgVideo.muted = true; // ensure muted for mobile autoplay
  bgVideo.playsInline = true;
  bgVideo.setAttribute('playsinline', '');
  bgVideo.setAttribute('webkit-playsinline', '');
  bgVideo.addEventListener('canplay', () => { videoReady = true; tryPlay(); }, { once: true });
  bgVideo.addEventListener('loadeddata', () => { tryPlay(); }, { once: true });
  // Kick off loading
  bgVideo.load();
  // Immediate attempt (works on most browsers)
  setTimeout(tryPlay, 100);
  setTimeout(tryPlay, 500);
}

const applyVideo = () => {
  if (!bgVideo) return;
  if (videoOn) {
    bgVideo.classList.remove('is-off');
    tryPlay();
  } else {
    bgVideo.classList.add('is-off');
    bgVideo.pause();
  }
  if (videoOnIcon) videoOnIcon.style.display = videoOn ? '' : 'none';
  if (videoOffIcon) videoOffIcon.style.display = videoOn ? 'none' : '';
  if (videoBtn) videoBtn.setAttribute('aria-pressed', String(videoOn));
};
applyVideo();
if (videoBtn) videoBtn.addEventListener('click', () => {
  videoOn = !videoOn;
  localStorage.setItem('ds-video', videoOn ? '1' : '0');
  applyVideo();
  showToast('Background video: ' + (videoOn ? 'ON' : 'OFF'));
  beep(videoOn ? 700 : 400, 0.06, 'triangle', 0.04);
});

// =========================================
// MOBILE DYNAMIC TILT — DISABLED for perf (was a per-rAF loop on every touch device)
// =========================================
// Note: rAF-based scroll-velocity tilt removed on touch devices. Touch tilt on
// [data-tilt] cards is kept (single touchmove → single rAF, no per-frame loop).
if (isTouch) {
  document.querySelectorAll('[data-tilt]').forEach(el => {
    let raf = null, startX = 0, startY = 0, active = false;
    el.addEventListener('touchstart', (e) => {
      const t = e.touches[0]; active = true;
      startX = t.clientX; startY = t.clientY;
    }, { passive: true });
    el.addEventListener('touchmove', (e) => {
      if (!active) return;
      const t = e.touches[0];
      const r = el.getBoundingClientRect();
      const px = (t.clientX - r.left) / r.width - 0.5;
      const py = (t.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(1000px) rotateX(${py * -6}deg) rotateY(${px * 8}deg) translateZ(8px)`;
        raf = null;
      });
    }, { passive: true });
    el.addEventListener('touchend', () => {
      active = false;
      el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    }, { passive: true });
  });
}

// =========================================
// GYROSCOPE 3D TILT (mobile premium feature) — gated to non-low-power
// =========================================
let gyroEnabled = false;
const initGyro = () => {
  if (!isTouch) return;
  if (lowCores || reduceMotion) return; // skip on low-power devices
  if (typeof DeviceOrientationEvent === 'undefined') return;
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    // iOS 13+ — request permission on first user interaction
    const request = () => {
      DeviceOrientationEvent.requestPermission().then(state => {
        if (state === 'granted') {
          gyroEnabled = true;
          attachGyro();
        }
        document.removeEventListener('click', request);
        document.removeEventListener('touchstart', request);
      }).catch(() => {});
    };
    document.addEventListener('click', request, { once: true });
    document.addEventListener('touchstart', request, { once: true });
  } else {
    // Android — automatic
    gyroEnabled = true;
    attachGyro();
  }
};
const attachGyro = () => {
  let baseBeta = null, baseGamma = null;
  let lastApply = 0;
  window.addEventListener('deviceorientation', (e) => {
    if (e.beta === null || e.gamma === null) return;
    if (baseBeta === null) { baseBeta = e.beta; baseGamma = e.gamma; return; }
    const now = performance.now();
    if (now - lastApply < 80) return; // throttle to ~12 fps, smooth enough
    lastApply = now;
    const beta = (e.beta - baseBeta) * 0.4;  // front-back (-180 to 180)
    const gamma = (e.gamma - baseGamma) * 0.4; // left-right (-90 to 90)
    if (heroTitle) heroTitle.style.transform = `perspective(1000px) rotateX(${beta * 0.3}deg) rotateY(${gamma * 0.3}deg) translateZ(0)`;
  });
};
initGyro();

// =========================================
// SWIPE BETWEEN SECTIONS (mobile nav)
// =========================================
let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
const sectionOrder = ['about', 'academic', 'achievements', 'cocurricular', 'reflection', 'memories', 'contact'];
let currentSectionIdx = 0;

document.addEventListener('touchstart', (e) => {
  if (e.target.closest('input, textarea, [data-tilt]')) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchStartTime = Date.now();
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (!touchStartX) return;
  const dt = Date.now() - touchStartTime;
  if (dt > 500) return;
  const dx = (e.changedTouches[0].clientX - touchStartX);
  const dy = (e.changedTouches[0].clientY - touchStartY);
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
  // Determine current section
  const y = window.scrollY + 100;
  let nearestIdx = 0, nearestDist = Infinity;
  sectionOrder.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const d = Math.abs(el.offsetTop - y);
    if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
  });
  currentSectionIdx = nearestIdx;
  // Swipe right → previous, swipe left → next
  if (dx < 0 && currentSectionIdx < sectionOrder.length - 1) {
    const next = document.getElementById(sectionOrder[currentSectionIdx + 1]);
    if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (navigator.vibrate) navigator.vibrate(8);
  } else if (dx > 0 && currentSectionIdx > 0) {
    const prev = document.getElementById(sectionOrder[currentSectionIdx - 1]);
    if (prev) prev.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (navigator.vibrate) navigator.vibrate(8);
  }
  touchStartX = 0;
}, { passive: true });

// =========================================
// SWIPE HINT (mobile only, dismissable)
// =========================================
const initSwipeHint = () => {
  if (window.innerWidth > 720) return;
  if (localStorage.getItem('ds-swipe-hint') === '1') return;
  const hint = document.createElement('div');
  hint.className = 'swipe-hint';
  hint.innerHTML = '<span class="swipe-hint__hand">👆</span><span>SWIPE TO NAVIGATE</span>';
  document.body.appendChild(hint);
  setTimeout(() => {
    hint.style.transition = 'opacity 0.6s, transform 0.6s';
    hint.style.opacity = '0';
    hint.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => hint.remove(), 700);
    localStorage.setItem('ds-swipe-hint', '1');
  }, 4500);
};
initSwipeHint();

// =========================================
// TAP RIPPLE on all touch devices
// =========================================
if (isTouch) {
  document.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    const ripple = document.createElement('div');
    ripple.className = 'touch-ripple__wave';
    const size = 80;
    Object.assign(ripple.style, {
      position: 'fixed', left: (t.clientX - size/2) + 'px', top: (t.clientY - size/2) + 'px',
      width: size + 'px', height: size + 'px', borderRadius: '50%',
      background: 'var(--accent)', opacity: '0.25', pointerEvents: 'none', zIndex: '9998',
      transform: 'scale(0)', transition: 'transform 0.55s var(--ease), opacity 0.55s',
    });
    document.body.appendChild(ripple);
    requestAnimationFrame(() => {
      ripple.style.transform = 'scale(3.5)';
      ripple.style.opacity = '0';
    });
    setTimeout(() => ripple.remove(), 600);
  }, { passive: true });
}

// =========================================
// FOOTER BRAND 3D tilt
// =========================================
const footerBrand = document.querySelector('.footer__brand');
if (footerBrand) {
  footerBrand.addEventListener('mousemove', (e) => {
    const r = footerBrand.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    footerBrand.style.transform = `perspective(600px) rotateX(${py * -8}deg) rotateY(${px * 12}deg)`;
    footerBrand.style.transition = 'transform 0.2s';
  });
  footerBrand.addEventListener('mouseleave', () => { footerBrand.style.transform = ''; footerBrand.style.transition = 'transform 0.6s var(--ease)'; });
}

// =========================================
// FIELD FOCUS 3D LIFT
// =========================================
document.querySelectorAll('.field input, .field textarea').forEach(el => {
  el.addEventListener('focus', () => {
    el.parentElement.style.transform = 'perspective(800px) translateZ(8px)';
    el.parentElement.style.transition = 'transform 0.4s var(--ease)';
  });
  el.addEventListener('blur', () => { el.parentElement.style.transform = ''; });
});

// =========================================
// ICON ROTATION on contact card hover
// =========================================
document.querySelectorAll('.contact__card').forEach(card => {
  const ico = card.querySelector('.contact__ico');
  if (ico) {
    card.addEventListener('mouseenter', () => { ico.style.transform = 'rotate(360deg) scale(1.1)'; ico.style.transition = 'transform 0.7s var(--ease)'; });
    card.addEventListener('mouseleave', () => { ico.style.transform = 'rotate(0deg) scale(1)'; ico.style.transition = 'transform 0.5s var(--ease)'; });
  }
  const arrow = card.querySelector('.contact__arrow');
  if (arrow) {
    card.addEventListener('mouseenter', () => { arrow.style.transform = 'translateX(6px)'; arrow.style.transition = 'transform 0.4s var(--ease)'; });
    card.addEventListener('mouseleave', () => { arrow.style.transform = 'translateX(0)'; });
  }
});

// =========================================
// HERO ROLE - hover each span reveals accent
// =========================================
document.querySelectorAll('.hero__role span').forEach(s => {
  s.style.transition = 'color 0.3s, letter-spacing 0.4s';
  s.addEventListener('mouseenter', () => { s.style.color = 'var(--accent)'; s.style.letterSpacing = '0.15em'; });
  s.addEventListener('mouseleave', () => { s.style.color = ''; s.style.letterSpacing = ''; });
});

// =========================================
// HERO META - counter animation for year
// =========================================
const metaYear = document.querySelector('.hero__meta-year');
if (metaYear) {
  const target = '2026 — 27';
  metaYear.textContent = '0000 — 00';
  setTimeout(() => {
    let i = 0;
    const chars = target.split('');
    const tick = () => {
      if (i > chars.length) return;
      metaYear.textContent = chars.map((c, idx) => idx < i ? c : (/\d/.test(c) ? Math.floor(Math.random()*10) : c)).join('');
      i++;
      if (i <= chars.length) setTimeout(tick, 50);
      else metaYear.textContent = target;
    };
    tick();
  }, 800);
}

// =========================================
// 5D CURSOR PROXIMITY GLOW (general)
// =========================================
document.querySelectorAll('.cert, .memory, .contact__card').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
  });
});

// =========================================
// SECTION SCROLL TILT (4D perspective) — runs on every device
// =========================================
const tiltSections = document.querySelectorAll('[data-tilt-section]');
const onScrollTilt = () => {
  const vh = window.innerHeight;
  tiltSections.forEach(s => {
    const r = s.getBoundingClientRect();
    const mid = r.top + r.height / 2 - vh / 2;
    const t = Math.max(-1, Math.min(1, mid / vh));
    s.style.transform = `perspective(1400px) rotateX(${t * -2.5}deg) translateZ(0)`;
  });
};

// =========================================
// HERO 3D SCROLL ROTATION — runs on every device
// =========================================
const heroTitle = document.querySelector('.hero__title');
const heroEyebrow = document.querySelector('.hero__eyebrow');
const heroQuote = document.querySelector('.hero__quote');
const onScrollHero = () => {
  const y = Math.min(window.scrollY, window.innerHeight);
  const progress = y / window.innerHeight;
  if (heroTitle) heroTitle.style.transform = `perspective(1000px) rotateX(${progress * 20}deg) translateY(${y * 0.18}px) translateZ(0)`;
  if (heroQuote) heroQuote.style.transform = `translateY(${y * 0.25}px) translateX(${y * 0.05}px)`;
  if (heroEyebrow) heroEyebrow.style.transform = `translateY(${y * 0.3}px)`;
};

// =========================================
// NAV scroll state
// =========================================
const nav = document.getElementById('nav');
const dock = document.getElementById('dock');
const onScrollNav = () => {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 30);
  dock.classList.toggle('is-visible', y > 400);
};

// =========================================
// ACTIVE SECTION in nav
// =========================================
const sections = ['about', 'academic', 'achievements', 'cocurricular', 'reflection', 'memories', 'contact']
  .map(id => document.getElementById(id)).filter(Boolean);
const navLinks = document.querySelectorAll('[data-link]');
const setActive = (id) => {
  navLinks.forEach(a => { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
  document.querySelectorAll('.dock__btn').forEach(b => { b.classList.toggle('is-active', b.getAttribute('data-target') === '#' + id); });
};
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(en => { if (en.isIntersecting) setActive(en.target.id); });
}, { rootMargin: '-40% 0px -50% 0px' });
sections.forEach(s => sectionObs.observe(s));

// =========================================
// SMOOTH SCROLL
// =========================================
document.querySelectorAll('[data-link]').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const t = document.querySelector(href);
      if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'start' }); beep(700, 0.05, 'sine', 0.04); }
    }
  });
});

// =========================================
// DOCK BUTTONS
// =========================================
document.querySelectorAll('.dock__btn').forEach(b => {
  b.addEventListener('click', () => {
    const sel = b.getAttribute('data-target');
    const t = document.querySelector(sel);
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    beep(900, 0.04, 'square', 0.04);
  });
});

// =========================================
// MOBILE DRAWER
// =========================================
const burger = document.getElementById('burger');
if (burger) {
  const drawer = document.createElement('div');
  drawer.className = 'drawer';
  drawer.innerHTML = `
    <a href="#about" data-link>About</a>
    <a href="#academic" data-link>Academic</a>
    <a href="#achievements" data-link>Achievements</a>
    <a href="#cocurricular" data-link>Activities</a>
    <a href="#reflection" data-link>Reflection</a>
    <a href="#memories" data-link>Memories</a>
    <a href="#contact" data-link>Contact</a>
  `;
  Object.assign(drawer.style, { position: 'fixed', top: '0', right: '0', height: '100vh', width: '80%', maxWidth: '320px', zIndex: '250', background: 'var(--paper)', padding: '100px 32px 32px', display: 'flex', flexDirection: 'column', gap: '22px', transform: 'translateX(100%)', transition: 'transform 0.45s cubic-bezier(0.22,1,0.36,1)', borderLeft: '1px solid var(--line)' });
  document.body.appendChild(drawer);
  drawer.querySelectorAll('a').forEach(a => Object.assign(a.style, { fontSize: '18px', color: 'var(--fg-2)' }));
  burger.addEventListener('click', () => {
    burger.classList.toggle('is-open');
    drawer.style.transform = burger.classList.contains('is-open') ? 'translateX(0)' : 'translateX(100%)';
  });
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('is-open');
    drawer.style.transform = 'translateX(100%)';
  }));
}

// =========================================
// RIPPLE EFFECT on clickable cards
// =========================================
document.querySelectorAll('.cert, .contact__card, .subject, .memory').forEach(el => {
  el.classList.add('ripple');
  el.addEventListener('click', (e) => {
    const r = el.getBoundingClientRect();
    const w = el.createDocumentFragment ? null : null;
    const wave = document.createElement('span');
    wave.className = 'ripple__wave';
    const size = Math.max(r.width, r.height) * 1.2;
    Object.assign(wave.style, {
      left: (e.clientX - r.left - size / 2) + 'px',
      top: (e.clientY - r.top - size / 2) + 'px',
      width: size + 'px',
      height: size + 'px',
      color: getComputedStyle(el).color
    });
    el.appendChild(wave);
    setTimeout(() => wave.remove(), 700);
  });
});

// =========================================
// CERT LIGHTBOX
// =========================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCap = document.getElementById('lightboxCap');
const lightboxClose = document.getElementById('lightboxClose');
document.querySelectorAll('.cert').forEach(c => {
  c.addEventListener('click', () => {
    const src = c.getAttribute('data-img');
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxCap.textContent = c.querySelector('.cert__title').textContent + ' · ' + c.querySelector('.cert__sub').textContent;
    lightbox.classList.add('is-open');
    beep(880, 0.06, 'triangle', 0.05);
  });
});
const closeLb = () => { if (lightbox) lightbox.classList.remove('is-open'); };
if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLb(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });

// =========================================
// CV DOWNLOAD
// =========================================
const cvBtn = document.getElementById('cvBtn');
if (cvBtn) {
  cvBtn.addEventListener('click', () => {
    beep(1100, 0.07, 'sine', 0.05);
    const cvHTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Darshil Singh — CV</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fafafa;color:#1a1a1a;padding:50px;line-height:1.6}
  .wrap{max-width:780px;margin:0 auto;background:#fff;padding:60px;box-shadow:0 2px 20px rgba(0,0,0,0.06);border-radius:8px}
  h1{font-family:Georgia,serif;font-size:38px;font-weight:300;letter-spacing:-0.02em}
  h1 em{font-style:italic;font-weight:300;color:#8b6f47}
  .sub{color:#777;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;margin-top:8px}
  .contact{margin:24px 0;padding:18px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;font-size:13px;display:flex;flex-wrap:wrap;gap:18px}
  .contact b{color:#555;font-weight:500;margin-right:6px}
  h2{font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#777;margin:32px 0 14px;padding-bottom:6px;border-bottom:1px solid #eee;font-weight:600}
  p{margin-bottom:10px;font-size:14px;color:#333}
  ul{margin-left:18px;font-size:14px;color:#333}
  ul li{margin-bottom:4px}
  .role{font-weight:600}
  @media print{body{background:#fff;padding:0}.wrap{box-shadow:none;padding:30px}}
</style></head><body><div class="wrap">
<h1>Darshil <em>Singh</em></h1>
<div class="sub">Class X Student · Problem Solver · Logical Thinker</div>
<div class="contact">
  <div><b>Email</b> darshilsingh37@gmail.com</div>
  <div><b>GitHub</b> github.com/darshilsingh37-commits</div>
  <div><b>School</b> Gayatri Public School</div>
  <div><b>Class</b> X — B</div>
  <div><b>Year</b> 2026 — 27</div>
</div>
<h2>Profile</h2>
<p>"Building ideas into reality." A curious learner with a strong interest in Physics, logical reasoning, and problem-solving. Enjoys reading manga and psychological thrillers; practices swimming for discipline and focus.</p>
<h2>Academic Focus</h2>
<p><span class="role">Science</span> — Physics Assignments and Numerical Problems · Practical and Lab Activities · Science Project Work · Multiple assessments (SEA)</p>
<p><span class="role">Mathematics</span> — Class Assignments · Group Activities (Proving Various Theorems) · Graph Activities · Multiple assessments (SEA) · Lab activities</p>
<p><span class="role">Social Science</span> — Map Work and Geography Activities · History Assignments and Projects · Civics and Economics Notes · Presentations and Class Activities · Multiple Assessments & Group Activities</p>
<p><span class="role">English</span> — Creative Writing & Essays · Poems · Grammar Projects · Presentations · Reading Activities</p>
<h2>Achievements</h2>
<ul>
  <li>National Science Olympiad (NSO) — Participated in 2022</li>
  <li>National Science Olympiad (NSO) — School Rank 1 in 2024</li>
  <li>Interschool Science Quiz — Won 2nd Prize</li>
  <li>Sanskriti Gyan Pariksha — Won 3rd Prize</li>
  <li>Sanskriti Gyan Pariksha — Won 1st Prize</li>
  <li>Sanskriti Gyan Pariksha — Won 2nd Prize</li>
</ul>
<h2>Co-Curricular</h2>
<p>Member of the School Cyber Club in Class VIII. Participated in school assembly presentations during Classes VI and VII. Developed public speaking, discipline, and team coordination through active school participation.</p>
<h2>Interests</h2>
<p>Physics · Manga · Swimming · Logical Problem Solving</p>
</div></body></html>`;
    const blob = new Blob([cvHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Darshil_Singh_CV.html';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('CV saved as Darshil_Singh_CV.html');
  });
}

// =========================================
// CONTACT FORM
// =========================================
const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cName').value.trim();
    const email = document.getElementById('cEmail').value.trim();
    const msg = document.getElementById('cMsg').value.trim();
    if (!name || !email || !msg) { contactStatus.textContent = 'Please fill in all fields.'; contactStatus.style.color = '#c08552'; beep(220, 0.1, 'sawtooth', 0.05); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { contactStatus.textContent = 'Please enter a valid email.'; contactStatus.style.color = '#c08552'; return; }
    const subject = 'Portfolio contact from ' + name;
    const body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + msg;
    const mailtoURL = `mailto:darshilsingh37@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    contactStatus.innerHTML = 'Sending&hellip;';
    contactStatus.style.color = 'var(--accent)';
    const sendBtn = contactForm.querySelector('button[type="submit"]');
    if (sendBtn) { sendBtn.disabled = true; sendBtn.style.opacity = '0.6'; }
    const fd = new FormData();
    fd.append('name', name);
    fd.append('email', email);
    fd.append('message', msg);
    fd.append('_subject', subject);
    fd.append('_captcha', 'false');
    fd.append('_template', 'table');
    fetch('https://formsubmit.co/ajax/darshilsingh37@gmail.com', {
      method: 'POST',
      body: fd,
      headers: { 'Accept': 'application/json' }
    }).then(r => r.json().then(j => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (ok && (j.success === 'true' || j.success === true)) {
          contactStatus.innerHTML = '✓ Message sent! I will reply to <b>' + email + '</b> soon.';
          contactStatus.style.color = '#2c5f5d';
          beep(990, 0.08, 'sine', 0.05); beep(1320, 0.08, 'sine', 0.05);
          contactForm.reset();
        } else {
          throw new Error('send-failed');
        }
      })
      .catch(() => {
        contactStatus.innerHTML = 'Couldn\'t send automatically. <a href="' + mailtoURL + '" style="color:var(--accent);text-decoration:underline;font-weight:600;">Click here to open in your mail app</a>, or email <a href="mailto:darshilsingh37@gmail.com" style="color:var(--accent);text-decoration:underline;">darshilsingh37@gmail.com</a> directly.';
        contactStatus.style.color = '#c08552';
        beep(220, 0.1, 'sawtooth', 0.05);
      })
      .finally(() => {
        if (sendBtn) { sendBtn.disabled = false; sendBtn.style.opacity = ''; }
        setTimeout(() => { contactStatus.textContent = ''; contactStatus.style.color = ''; }, 10000);
      });
  });
}

// =========================================
// EASTER EGGS (multiple)
// =========================================

const confettiBurst = (count = 80) => {
  const colors = ['#8b6f47', '#2c5f5d', '#c08552', '#a78bfa', '#6ee7ff', '#f472b6'];
  for (let i = 0; i < count; i++) {
    const c = document.createElement('div');
    c.style.cssText = `position:fixed;left:50%;top:50%;width:8px;height:14px;background:${colors[i%colors.length]};pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:transform 1.2s cubic-bezier(.22,1,.36,1),opacity 1.2s;border-radius:2px`;
    document.body.appendChild(c);
    const a = Math.random() * Math.PI * 2; const v = 200 + Math.random() * 400;
    requestAnimationFrame(() => {
      c.style.transform = `translate(calc(-50% + ${Math.cos(a)*v}px), calc(-50% + ${Math.sin(a)*v}px)) rotate(${Math.random()*720}deg)`;
      c.style.opacity = '0';
    });
    setTimeout(() => c.remove(), 1300);
  }
};

let easterEggTriggered = false;
const triggerEasterEgg = (msg) => {
  if (easterEggTriggered) return;
  easterEggTriggered = true;
  confettiBurst();
  showToast(msg || '🎉 Secret found!');
  beep(660, 0.1, 'sine', 0.08);
  beep(880, 0.1, 'sine', 0.08);
  setTimeout(() => beep(1320, 0.15, 'sine', 0.08), 200);
  const secret = document.getElementById('secret');
  if (secret) {
    secret.classList.add('is-revealed');
    secret.setAttribute('aria-hidden', 'false');
    setTimeout(() => secret.scrollIntoView({ behavior: 'smooth', block: 'center' }), 600);
  }
  setTimeout(() => { easterEggTriggered = false; }, 30000);
};

// Easter Egg 1: Konami code
const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
let konamiIdx = 0;
document.addEventListener('keydown', (e) => {
  if (e.keyCode === konami[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === konami.length) { konamiIdx = 0; triggerEasterEgg('🎮 KONAMI! You found it!'); }
  } else { konamiIdx = 0; }
});

// Easter Egg 2: Type "darshil"
let typed = '';
document.addEventListener('keydown', (e) => {
  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
    typed += e.key.toLowerCase();
    if (typed.length > 20) typed = typed.slice(-20);
    if (typed.includes('darshil')) {
      typed = '';
      triggerEasterEgg('👋 Hey, you typed my name!');
    }
  }
});

// Easter Egg 3: Click nav logo 7 times
let logoClicks = 0;
const navBrand = document.querySelector('.nav__brand');
if (navBrand) {
  navBrand.addEventListener('click', () => {
    logoClicks++;
    if (logoClicks >= 7) {
      logoClicks = 0;
      triggerEasterEgg('🎯 Logo master! 7 clicks!');
    }
  });
}

// Easter Egg 4: Click hero title 3 times
let titleClicks = 0;
if (heroTitle) {
  heroTitle.addEventListener('click', () => {
    titleClicks++;
    if (titleClicks >= 3) {
      titleClicks = 0;
      triggerEasterEgg('✨ You found the title secret!');
    }
  });
}

// Easter Egg 5: Double-click hero eyebrow
if (heroEyebrow) {
  heroEyebrow.addEventListener('dblclick', () => {
    triggerEasterEgg('🌟 Quick double-click!');
  });
}

// Easter Egg 6: Click avatar 5 times (3 on mobile)
let avatarClicks = 0;
const aboutAvatar = document.getElementById('aboutAvatar');
if (aboutAvatar) {
  const avatarTarget = isTouch ? 3 : 5;
  const clickHandler = () => {
    avatarClicks++;
    if (avatarClicks >= avatarTarget) {
      avatarClicks = 0;
      triggerEasterEgg('🎭 You found the avatar secret!');
    }
  };
  aboutAvatar.addEventListener('click', clickHandler);
  aboutAvatar.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clickHandler(); } });
  // Long-press easter egg (mobile)
  if (isTouch) {
    let pressTimer = null;
    aboutAvatar.addEventListener('touchstart', () => {
      pressTimer = setTimeout(() => triggerEasterEgg('👆 Long-press secret!'), 1200);
    }, { passive: true });
    aboutAvatar.addEventListener('touchend', () => clearTimeout(pressTimer), { passive: true });
    aboutAvatar.addEventListener('touchmove', () => clearTimeout(pressTimer), { passive: true });
  }
}

// =========================================
// IMAGE INNER TILT (cert + memory images)
// =========================================
document.querySelectorAll('.cert, .memory').forEach(card => {
  const imgWrap = card.querySelector('.cert__img, .memory__img');
  if (!imgWrap) return;
  const onMove = (clientX, clientY) => {
    const r = card.getBoundingClientRect();
    const px = (clientX - r.left) / r.width - 0.5;
    const py = (clientY - r.top) / r.height - 0.5;
    imgWrap.style.transform = `perspective(800px) rotateX(${py * -6}deg) rotateY(${px * 8}deg) scale(1.04) translateZ(10px)`;
    const inner = imgWrap.querySelector('img');
    if (inner) inner.style.transform = `scale(1.08) translateX(${px * -8}px) translateY(${py * -8}px)`;
  };
  card.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
  card.addEventListener('touchmove', (e) => {
    const t = e.touches[0]; onMove(t.clientX, t.clientY);
  }, { passive: true });
  const reset = () => {
    imgWrap.style.transform = '';
    const inner = imgWrap.querySelector('img');
    if (inner) inner.style.transform = '';
  };
  card.addEventListener('mouseleave', reset);
  card.addEventListener('touchend', reset, { passive: true });
});

// =========================================
// MAGNETIC BUTTONS
// =========================================
document.querySelectorAll('.btn--primary').forEach(btn => {
  btn.classList.add('magnetic');
  let raf = null;
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    if (!raf) raf = requestAnimationFrame(() => {
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      raf = null;
    });
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
  });
});

// =========================================
// MASTER SCROLL HANDLER (throttled to rAF)
// =========================================
let ticking = false;
const onScroll = () => {
  if (ticking) return;
  scrollY = window.scrollY;
  ticking = true;
  requestAnimationFrame(() => {
    onScrollNav();
    onScrollTilt();
    onScrollHero();
    tickParallax();
    ticking = false;
  });
};
window.addEventListener('scroll', onScroll, { passive: true });

// =========================================
// INIT
// =========================================
window.addEventListener('load', () => {
  onScrollNav();
  onScrollTilt();
  onScrollHero();
  tickParallax();
});

window.DS = { setSound, cycleTheme, showToast, triggerEasterEgg };
