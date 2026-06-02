/* =========================================================
   Darshil Portfolio Enhancements
   (no content changes, only professional UI + animations)
   ========================================================= */

document.documentElement.classList.add('js');

const navbar = document.querySelector('.navbar');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const progressBar = document.querySelector('.scroll-progress__bar');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lightbox = document.getElementById('lightbox');
const lightboxImage = lightbox?.querySelector('.lightbox__image');
const lightboxCaption = lightbox?.querySelector('.lightbox__caption');
const lightboxCloseTargets = lightbox?.querySelectorAll('[data-lightbox-close]');
let lightboxLastFocus = null;
let scrollRaf = 0;

const setNavbarState = () => {
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 40);
};

const setScrollProgress = () => {
    if (!progressBar) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
};

const isLightboxOpen = () => lightbox?.classList.contains('is-open');

const closeLightbox = () => {
    if (!lightbox) return;
    if (!isLightboxOpen()) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (lightboxImage) {
        lightboxImage.removeAttribute('src');
        lightboxImage.removeAttribute('alt');
        lightboxImage.classList.remove('is-rotated');
    }
    if (lightboxCaption) lightboxCaption.textContent = '';
    if (lightboxLastFocus && typeof lightboxLastFocus.focus === 'function') {
        lightboxLastFocus.focus();
    }
    lightboxLastFocus = null;
};

const openLightbox = ({ src, alt, caption, rotated = false }) => {
    if (!lightbox || !lightboxImage) return;
    lightboxLastFocus = document.activeElement;
    lightboxImage.src = src;
    if (alt) lightboxImage.alt = alt;
    if (rotated) lightboxImage.classList.add('is-rotated');
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    const closeBtn = lightbox.querySelector('.lightbox__close');
    if (closeBtn && typeof closeBtn.focus === 'function') closeBtn.focus();
};

/* -------------------------
   Mobile menu (class-based)
   ------------------------- */
const closeNav = () => document.body.classList.remove('nav-open');
const toggleNav = () => document.body.classList.toggle('nav-open');

if (menuToggle && navLinks) {
    menuToggle.setAttribute('role', 'button');
    menuToggle.setAttribute('tabindex', '0');
    menuToggle.setAttribute('aria-label', 'Toggle navigation menu');

    menuToggle.addEventListener('click', toggleNav);
    menuToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleNav();
        }
    });

    // Close menu when clicking a link (mobile)
    navLinks.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', () => closeNav());
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!document.body.classList.contains('nav-open')) return;
        const target = e.target;
        const clickedInsideNav = navbar && navbar.contains(target);
        if (!clickedInsideNav) closeNav();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (isLightboxOpen()) {
            closeLightbox();
            return;
        }
        closeNav();
    });
}

/* -------------------------
   Smooth scroll (with offset)
   ------------------------- */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        e.preventDefault();

        const headerOffset = 82;
        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    });
});

/* -------------------------
   Scroll reveal (more detailed)
   - Adds reveal to cards automatically
   - Staggered delays
   ------------------------- */
const autoRevealTargets = [
    '.card',
    '.achievement-card',
    '.memory-card',
    '.content-box',
    '.reflection-card'
];

autoRevealTargets.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
        if (!el.classList.contains('reveal')) el.classList.add('reveal');
    });
});

const applyStagger = (selector, step = 70, max = 420) => {
    const els = Array.from(document.querySelectorAll(selector));
    els.forEach((el, i) => {
        const delay = Math.min((i % 6) * step, max);
        el.style.setProperty('--reveal-delay', `${delay}ms`);
    });
};

applyStagger('.card', 80);
applyStagger('.achievement-card', 70);
applyStagger('.memory-card', 90);

const applyRevealVariants = () => {
    document.querySelectorAll('.card').forEach((el, i) => {
        el.classList.add(i % 2 === 0 ? 'reveal--left' : 'reveal--right');
    });
    document.querySelectorAll('.achievement-card').forEach((el) => {
        el.classList.add('reveal--scale');
    });
};

const initRevealObserver = () => {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    if (prefersReducedMotion) {
        revealElements.forEach((el) => el.classList.add('active'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            });
        },
        { threshold: 0.14, rootMargin: '0px 0px -10% 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));
};

const initGsapReveal = () => {
    const canUseGsap = !prefersReducedMotion && typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    if (!canUseGsap) return false;

    document.documentElement.classList.add('use-gsap');
    window.gsap.registerPlugin(window.ScrollTrigger);

    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        window.gsap.fromTo(
            heroContent,
            { autoAlpha: 0, y: 18, filter: 'blur(12px)' },
            { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.95, ease: 'power3.out' }
        );
    }

    const heroTargets = ['.subtitle', '.main-title', '.tagline', '.hero-quote', '.school-info'];
    window.gsap.fromTo(
        heroTargets,
        { autoAlpha: 0, y: 18, filter: 'blur(8px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.05, ease: 'power3.out', stagger: 0.12, delay: 0.18 }
    );

    const revealElements = Array.from(document.querySelectorAll('.reveal')).filter((el) => !el.closest('#home'));
    if (!revealElements.length) return true;

    revealElements.forEach((el) => {
        const style = getComputedStyle(el);
        const delayValue = style.getPropertyValue('--reveal-delay').trim();
        const delayMs = delayValue.endsWith('ms') ? parseFloat(delayValue) : parseFloat(delayValue) * 1000;
        const delay = Number.isFinite(delayMs) ? delayMs / 1000 : 0;

        const fromVars = { autoAlpha: 0, x: 0, y: 28, scale: 1, filter: 'blur(10px)' };
        if (el.classList.contains('reveal--left')) {
            fromVars.x = -42;
            fromVars.y = 0;
        } else if (el.classList.contains('reveal--right')) {
            fromVars.x = 42;
            fromVars.y = 0;
        } else if (el.classList.contains('reveal--scale')) {
            fromVars.scale = 0.94;
            fromVars.y = 0;
        }

        window.gsap.fromTo(
            el,
            fromVars,
            {
                autoAlpha: 1,
                x: 0,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                duration: 0.95,
                ease: 'power3.out',
                delay,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 86%',
                    once: true
                }
            }
        );
    });

    return true;
};

/* -------------------------
   Active nav link highlight
   ------------------------- */
const initActiveNav = () => {
    const sections = document.querySelectorAll('main section[id]');
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !links.length) return;

    const byId = new Map();
    links.forEach((a) => {
        const id = a.getAttribute('href')?.replace('#', '');
        if (id) byId.set(id, a);
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = entry.target.getAttribute('id');
                if (!id) return;

                links.forEach((a) => a.classList.remove('active'));
                const active = byId.get(id);
                if (active) active.classList.add('active');
            });
        },
        { threshold: 0.52 }
    );

    sections.forEach((s) => observer.observe(s));
};

/* -------------------------
   Card hover spotlight (CSS vars)
   ------------------------- */
const initCardSpotlight = () => {
    const cards = document.querySelectorAll('.card');
    if (!cards.length) return;

    cards.forEach((card) => {
        card.addEventListener('pointermove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mx', `${x}%`);
            card.style.setProperty('--my', `${y}%`);
        });
    });
};

const initLightbox = () => {
    if (!lightbox) return;

    if (lightboxCloseTargets) {
        lightboxCloseTargets.forEach((el) => el.addEventListener('click', closeLightbox));
    }

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (!isLightboxOpen()) return;
        e.preventDefault();
        closeLightbox();
    });

    document.querySelectorAll('.achievement-card .certificate-image img').forEach((img) => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            const card = img.closest('.achievement-card');
            const title = card?.querySelector('.achievement-info h4')?.textContent?.trim() || '';
            const sub = card?.querySelector('.achievement-info p')?.textContent?.trim() || '';
            const caption = [title, sub].filter(Boolean).join(' — ');
            openLightbox({
                src: img.currentSrc || img.src,
                alt: img.alt || caption,
                caption,
                rotated: img.classList.contains('cert-fix')
            });
        });
    });
};

const initScrollEffects = () => {
    const onScroll = () => {
        if (scrollRaf) return;
        scrollRaf = window.requestAnimationFrame(() => {
            setNavbarState();
            setScrollProgress();
            scrollRaf = 0;
        });
    };

    setNavbarState();
    setScrollProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', setScrollProgress, { passive: true });
};

/* -------------------------
   Init
   ------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    initScrollEffects();
    initActiveNav();
    initCardSpotlight();
    initLightbox();
    applyRevealVariants();

    const usingGsap = initGsapReveal();
    if (!usingGsap) initRevealObserver();
});
