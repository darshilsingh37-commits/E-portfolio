/* =========================================================
   Darshil Portfolio Enhancements
   (no content changes, only professional UI + animations)
   ========================================================= */

const navbar = document.querySelector('.navbar');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const setNavbarState = () => {
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 40);
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

    // Escape to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeNav();
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

/* -------------------------
   Init
   ------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    setNavbarState();
    initRevealObserver();
    initActiveNav();
    initCardSpotlight();
});

window.addEventListener('scroll', setNavbarState, { passive: true });
