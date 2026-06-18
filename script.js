const body = document.body;
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelector('.nav-links');
const menuToggle = document.querySelector('.menu-toggle');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const modeToast = document.querySelector('.mode-toast');
const logo = document.querySelector('.logo');
const tiltSurfaces = [...document.querySelectorAll('.tilt-surface')];
const magneticItems = [...document.querySelectorAll('.magnetic')];
const navAnchors = [...document.querySelectorAll('.nav-links a, .hero-actions a, .scroll-indicator')];
const revealElements = [...document.querySelectorAll('.reveal')];
const sections = [...document.querySelectorAll('main section[id]')];
const ambientLayers = [...document.querySelectorAll('.ambient')];
const mediaReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mediaFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

const state = {
    reducedMotion: mediaReducedMotion.matches,
    finePointer: mediaFinePointer.matches,
    hyperMode: false,
    motionFactor: 1,
    toastTimer: null,
    isCanvasVisible: true
};
function getNavOffset() {
    return navbar ? navbar.offsetHeight + 8 : 88;
}

function showToast(message) {
    if (!modeToast) {
        return;
    }

    window.clearTimeout(state.toastTimer);
    modeToast.textContent = message;
    modeToast.classList.add('is-visible');
    state.toastTimer = window.setTimeout(() => {
        modeToast.classList.remove('is-visible');
    }, 2200);
}

function syncMotionPreferences() {
    state.reducedMotion = mediaReducedMotion.matches;
    state.finePointer = mediaFinePointer.matches;

    if (state.finePointer && !state.reducedMotion) {
        body.classList.add('cursor-enabled');
    } else {
        body.classList.remove('cursor-enabled', 'cursor-hover');
    }

    if (state.reducedMotion) {
        tiltSurfaces.forEach((surface) => {
            surface.style.transform = '';
            surface.classList.remove('is-tilting');
        });
        magneticItems.forEach((item) => {
            item.style.transform = '';
        });
        ambientLayers.forEach((layer) => {
            layer.style.transform = '';
        });
    }
}

function toggleNav(forceState) {
    if (!menuToggle || !navLinks) {
        return;
    }

    const nextState = typeof forceState === 'boolean' ? forceState : !body.classList.contains('nav-open');
    body.classList.toggle('nav-open', nextState);
    menuToggle.setAttribute('aria-expanded', String(nextState));
}

function initNavigation() {
    if (menuToggle) {
        menuToggle.addEventListener('click', () => toggleNav());
    }

    navAnchors.forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const href = anchor.getAttribute('href');

            if (!href || !href.startsWith('#')) {
                return;
            }

            const target = document.querySelector(href);
            if (!target) {
                return;
            }

            event.preventDefault();
            toggleNav(false);

            window.scrollTo({
                top: target.offsetTop - getNavOffset(),
                behavior: state.reducedMotion ? 'auto' : 'smooth'
            });
        });
    });

    document.addEventListener('click', (event) => {
        if (!body.classList.contains('nav-open')) {
            return;
        }

        const clickInsideMenu = navLinks?.contains(event.target);
        const clickOnToggle = menuToggle?.contains(event.target);

        if (!clickInsideMenu && !clickOnToggle) {
            toggleNav(false);
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            toggleNav(false);
        }
    });
}

function updateNavbar() {
    if (!navbar) {
        return;
    }

    navbar.classList.toggle('is-scrolled', window.scrollY > 24);
}

function initActiveSectionTracking() {
    if (!('IntersectionObserver' in window) || !sections.length) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            const id = entry.target.getAttribute('id');
            document.querySelectorAll('.nav-links a').forEach((link) => {
                link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
            });
        });
    }, {
        rootMargin: '-35% 0px -45% 0px',
        threshold: 0.1
    });

    sections.forEach((section) => observer.observe(section));
}

function initReveal() {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // 1. Page Load Entrance (Hero Section Elements)
    if (!state.reducedMotion) {
        const heroTl = gsap.timeline();

        // Prepare containers so they don't hide nested animation items
        gsap.set(".hero-copy, .hero-stack", { opacity: 1, y: 0 });

        // Set initial values for child elements to slide up smoothly
        gsap.set(".hero-topline, .main-title, .tagline, .hero-description, .hero-actions, .hero-contact, .hero-quote", {
            opacity: 0,
            y: 40
        });
        gsap.set(".hero-stack > *", {
            opacity: 0,
            y: 40
        });

        heroTl.to(".hero-topline", {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power4.out"
        })
        .to(".main-title", {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power4.out"
        }, "-=0.8")
        .to([".tagline", ".hero-description"], {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power4.out",
            stagger: 0.15
        }, "-=0.9")
        .to(".hero-actions", {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power4.out"
        }, "-=0.95")
        .to([".hero-contact", ".hero-quote"], {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power4.out",
            stagger: 0.15
        }, "-=0.95")
        .to(".hero-stack > *", {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power4.out",
            stagger: 0.15
        }, "-=1.0");
    } else {
        // If reduced motion is enabled, show all elements immediately
        gsap.set(".hero-copy, .hero-stack, .hero-topline, .main-title, .tagline, .hero-description, .hero-actions, .hero-contact, .hero-quote, .hero-stack > *", {
            opacity: 1,
            y: 0
        });
    }

    // 2. Scroll Triggered Revelations for other sections/components
    const reveals = gsap.utils.toArray('.reveal');
    const scrollReveals = reveals.filter(el => !el.closest('#home'));

    if (state.reducedMotion) {
        scrollReveals.forEach(el => gsap.set(el, { opacity: 1, y: 0 }));
        return;
    }

    scrollReveals.forEach((el) => {
        gsap.set(el, { opacity: 0, y: 35 });

        gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none none"
            }
        });
    });
}

function initCursor() {
    if (!cursorDot || !cursorRing || !state.finePointer || state.reducedMotion) {
        return;
    }

    const dot = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: dot.x, y: dot.y };
    const target = { x: dot.x, y: dot.y };

    const animate = () => {
        dot.x += (target.x - dot.x) * 0.34;
        dot.y += (target.y - dot.y) * 0.34;
        ring.x += (target.x - ring.x) * 0.16;
        ring.y += (target.y - ring.y) * 0.16;

        cursorDot.style.transform = `translate(${dot.x}px, ${dot.y}px) translate(-50%, -50%)`;
        cursorRing.style.transform = `translate(${ring.x}px, ${ring.y}px) translate(-50%, -50%)`;

        window.requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', (event) => {
        target.x = event.clientX;
        target.y = event.clientY;
    }, { passive: true });

    document.querySelectorAll('a, button, .magnetic, .tilt-surface').forEach((item) => {
        item.addEventListener('pointerenter', () => body.classList.add('cursor-hover'));
        item.addEventListener('pointerleave', () => body.classList.remove('cursor-hover'));
    });

    animate();
}

function initMagnetic() {
    if (!state.finePointer || state.reducedMotion) {
        return;
    }

    magneticItems.forEach((item) => {
        item.addEventListener('pointermove', (event) => {
            const rect = item.getBoundingClientRect();
            const strength = body.classList.contains('hyper-mode') ? 0.18 : 0.12;
            const x = (event.clientX - rect.left - rect.width / 2) * strength;
            const y = (event.clientY - rect.top - rect.height / 2) * strength;

            item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });

        item.addEventListener('pointerleave', () => {
            item.style.transform = '';
        });
    });
}

function initTilt() {
    if (!state.finePointer || state.reducedMotion) {
        return;
    }

    tiltSurfaces.forEach((surface) => {
        const img = surface.querySelector('img');
        const isCertFix = img?.classList.contains('cert-fix');
        const baseImgTransform = isCertFix ? "rotate(-90deg)" : "";

        surface.addEventListener('pointermove', (event) => {
            const rect = surface.getBoundingClientRect();
            const depth = Number(surface.dataset.tiltDepth || 10) * state.motionFactor;
            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;
            const rotateY = (px - 0.5) * depth;
            const rotateX = (0.5 - py) * depth;

            surface.style.setProperty('--mx', `${Math.round(px * 100)}%`);
            surface.style.setProperty('--my', `${Math.round(py * 100)}%`);

            // Ultra-smooth tracking using GSAP
            gsap.to(surface, {
                transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, -4px, 0)`,
                duration: 0.35,
                ease: "power2.out",
                overwrite: "auto"
            });

            surface.classList.add('is-tilting');
        });

        surface.addEventListener('pointerenter', () => {
            if (img) {
                gsap.to(img, {
                    transform: `${baseImgTransform} scale(1.05)`,
                    duration: 0.45,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            }
        });

        surface.addEventListener('pointerleave', () => {
            // Snaps back with a smooth spring bounce on leave
            gsap.to(surface, {
                transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) translate3d(0, 0px, 0)",
                duration: 0.8,
                ease: "elastic.out(1.05, 0.6)",
                overwrite: "auto",
                onComplete: () => {
                    surface.classList.remove('is-tilting');
                    surface.style.transform = '';
                }
            });

            if (img) {
                gsap.to(img, {
                    transform: `${baseImgTransform} scale(1.0)`,
                    duration: 0.8,
                    ease: "elastic.out(1.05, 0.6)",
                    overwrite: "auto"
                });
            }
        });
    });
}

function initAmbientParallax() {
    if (!ambientLayers.length || state.reducedMotion) {
        return;
    }

    const pointer = { x: 0.5, y: 0.5 };
    let rafId = null;

    const render = () => {
        ambientLayers.forEach((layer, index) => {
            const drift = (index + 1) * 12 * state.motionFactor;
            const x = (pointer.x - 0.5) * drift;
            const y = (pointer.y - 0.5) * drift;
            layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
        rafId = null;
    };

    window.addEventListener('pointermove', (event) => {
        pointer.x = event.clientX / window.innerWidth;
        pointer.y = event.clientY / window.innerHeight;

        if (!rafId) {
            rafId = window.requestAnimationFrame(render);
        }
    }, { passive: true });
}

function setHyperMode(enabled) {
    if (state.reducedMotion) {
        showToast('Reduced motion is enabled, so advanced motion mode stays limited.');
        return;
    }

    state.hyperMode = enabled;
    state.motionFactor = enabled ? 1.45 : 1;
    body.classList.toggle('hyper-mode', enabled);
    showToast(enabled ? '4D motion mode enabled' : '4D motion mode disabled');
}

function initEasterEgg() {
    let sequence = '';
    let logoClicks = 0;
    let clickTimer = null;
    const secretWord = 'ORBIT';

    document.addEventListener('keydown', (event) => {
        if (event.key.length !== 1) {
            return;
        }

        sequence = `${sequence}${event.key.toUpperCase()}`.slice(-secretWord.length);
        if (sequence === secretWord) {
            setHyperMode(!state.hyperMode);
            sequence = '';
        }
    });

    if (logo) {
        logo.addEventListener('click', () => {
            logoClicks += 1;
            window.clearTimeout(clickTimer);

            if (logoClicks >= 4) {
                setHyperMode(!state.hyperMode);
                logoClicks = 0;
                return;
            }

            clickTimer = window.setTimeout(() => {
                logoClicks = 0;
            }, 1400);
        });
    }
}

function initMediaListeners() {
    const handleChange = () => syncMotionPreferences();

    if (typeof mediaReducedMotion.addEventListener === 'function') {
        mediaReducedMotion.addEventListener('change', handleChange);
        mediaFinePointer.addEventListener('change', handleChange);
    } else {
        mediaReducedMotion.addListener(handleChange);
        mediaFinePointer.addListener(handleChange);
    }
}

function initThreeParticles() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas || state.reducedMotion) {
        return;
    }

    // High Density: 180k on desktop, 45k on mobile for rich volumetric point clouds
    const isMobile = !state.finePointer || window.innerWidth <= 900;
    const particleCount = isMobile ? 45000 : 180000;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    
    // Add fog to fade out distant points; start with midnight dark fog
    scene.fog = new THREE.FogExp2('#050c0e', isMobile ? 0.00095 : 0.00072);
    
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3500);
    camera.position.z = 100;
    camera.position.y = 160; // Starts high up in the sky looking down

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isMobile });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Dynamic texture generation (creates soft circular glowing firefly-like points)
    function createCircleTexture() {
        const canvasTexture = document.createElement('canvas');
        canvasTexture.width = 16;
        canvasTexture.height = 16;
        const ctx = canvasTexture.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
        return new THREE.CanvasTexture(canvasTexture);
    }

    // Winding path center function (creates a dynamic corridor with straight lines and curves)
    function getPathX(z) {
        const t = Math.max(0, Math.min(1, (100 - z) / 3200));
        if (t < 0.20) {
            return Math.sin(z * 0.0008) * 35;
        } else if (t < 0.38) {
            const p = (t - 0.20) / 0.18;
            const startX = Math.sin((100 - 0.20 * 3200) * 0.0008) * 35;
            const endX = Math.sin((100 - 0.38 * 3200) * 0.0035) * 36 + Math.cos((100 - 0.38 * 3200) * 0.0010) * 20;
            return startX + (endX - startX) * p;
        } else if (t < 0.82) {
            return Math.sin(z * 0.0035) * 36 + Math.cos(z * 0.0010) * 20;
        } else {
            return Math.sin(z * 0.0012) * 55;
        }
    }

    // Camera height (Y-axis) profile over the flight
    function getCameraY(z) {
        const t = Math.max(0, Math.min(1, (100 - z) / 3200));
        if (t < 0.20) {
            const p = t / 0.20;
            return 160 - p * 15; // 160 -> 145 (starts high in sky)
        } else if (t < 0.38) {
            const p = (t - 0.20) / 0.18;
            const ease = (1 - Math.cos(p * Math.PI)) / 2;
            return 145 + ease * (10 - 145); // 145 -> 10 (dives into dense forest)
        } else if (t < 0.48) {
            const p = (t - 0.38) / 0.10;
            const ease = (1 - Math.cos(p * Math.PI)) / 2;
            return 10 + ease * (-22 - 10); // 10 -> -22 (falls close to sea/ground)
        } else if (t < 0.82) {
            const p = (t - 0.48) / 0.34;
            return -22 + Math.sin(p * Math.PI * 4) * 1.5; // skimming water/canyon with bobbing
        } else if (t < 0.98) {
            const p = (t - 0.82) / 0.16;
            const ease = (1 - Math.cos(p * Math.PI)) / 2;
            return -22 + ease * (125 - (-22)); // -22 -> 125 (climbs back up to clouds)
        } else {
            const p = (t - 0.98) / 0.02;
            return 125 + p * 5; // 125 -> 130
        }
    }

    // Procedural branching tree generator (builds realistic trunks, branches, and leaf canopies)
    function generateTreePoints(treeX, treeZ, pointsPerTree, positionsArray, colorsArray, startIndex) {
        let index = startIndex;
        const maxPoints = startIndex + pointsPerTree * 3;
        
        // Distribute points: 35% on branches/trunk, 65% on leaves
        const branchPointsCount = Math.floor(pointsPerTree * 0.35);
        const leafPointsCount = pointsPerTree - branchPointsCount;
        
        let branches = [];
        let tips = [];
        
        // Recursive fractal branching function
        function buildBranch(startX, startY, startZ, dirX, dirY, dirZ, length, radius, depth) {
            const endX = startX + dirX * length;
            const endY = startY + dirY * length;
            const endZ = startZ + dirZ * length;
            
            branches.push({
                startX, startY, startZ,
                endX, endY, endZ,
                radius,
                depth
            });
            
            if (depth >= 4 || length < 2.5) {
                tips.push({ x: endX, y: endY, z: endZ });
                return;
            }
            
            const numSplits = 2 + Math.floor(Math.random() * 2); // 2 or 3 splits
            for (let i = 0; i < numSplits; i++) {
                const angleYaw = (Math.random() - 0.5) * 1.3;
                const anglePitch = 0.35 + Math.random() * 0.65;
                
                let dx = dirX + Math.sin(angleYaw) * 0.5;
                let dy = dirY + anglePitch * 0.5;
                let dz = dirZ + Math.cos(angleYaw) * 0.5;
                
                const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
                dx /= len;
                dy /= len;
                dz /= len;
                
                buildBranch(endX, endY, endZ, dx, dy, dz, length * 0.72, radius * 0.65, depth + 1);
            }
        }
        
        const trunkHeight = 15 + Math.random() * 8;
        const trunkRadius = 1.3 + Math.random() * 0.5;
        buildBranch(treeX, -25, treeZ, 0, 1, 0, trunkHeight, trunkRadius, 0);
        
        // Write branch/trunk points
        const pointsPerBranch = Math.floor(branchPointsCount / branches.length);
        for (const b of branches) {
            for (let p = 0; p < pointsPerBranch; p++) {
                if (index >= maxPoints) break;
                
                const t = Math.random();
                const cx = b.startX + (b.endX - b.startX) * t;
                const cy = b.startY + (b.endY - b.startY) * t;
                const cz = b.startZ + (b.endZ - b.startZ) * t;
                
                const r = Math.random() * b.radius;
                const angle = Math.random() * Math.PI * 2;
                const px = cx + Math.cos(angle) * r;
                const py = cy;
                const pz = cz + Math.sin(angle) * r;
                
                positionsArray[index] = px;
                positionsArray[index + 1] = py;
                positionsArray[index + 2] = pz;
                
                // Brown colors for wood (darker at base)
                const factor = 0.6 + (b.depth / 5) * 0.4;
                colorsArray[index] = (0.28 + Math.random() * 0.08) * factor;     
                colorsArray[index + 1] = (0.16 + Math.random() * 0.06) * factor; 
                colorsArray[index + 2] = (0.08 + Math.random() * 0.04) * factor; 
                index += 3;
            }
        }
        
        // Write foliage leaf points around tips
        const pointsPerTip = Math.floor(leafPointsCount / tips.length);
        for (const tip of tips) {
            for (let p = 0; p < pointsPerTip; p++) {
                if (index >= maxPoints) break;
                
                const radius = 5.5 + Math.random() * 4.5;
                const u = Math.random();
                const v = Math.random();
                const theta = u * 2.0 * Math.PI;
                const phi = Math.acos(2.0 * v - 1.0);
                
                const px = tip.x + radius * Math.sin(phi) * Math.cos(theta);
                const py = tip.y + radius * Math.sin(phi) * Math.sin(theta);
                const pz = tip.z + radius * Math.cos(phi);
                
                positionsArray[index] = px;
                positionsArray[index + 1] = py;
                positionsArray[index + 2] = pz;
                
                // Greens & Gold Highlights
                const leafType = Math.random();
                if (leafType < 0.65) {
                    colorsArray[index] = 0.08 + Math.random() * 0.08;     
                    colorsArray[index + 1] = 0.44 + Math.random() * 0.16; 
                    colorsArray[index + 2] = 0.12 + Math.random() * 0.08; 
                } else if (leafType < 0.88) {
                    colorsArray[index] = 0.38 + Math.random() * 0.12;     
                    colorsArray[index + 1] = 0.58 + Math.random() * 0.12; 
                    colorsArray[index + 2] = 0.08 + Math.random() * 0.06; 
                } else {
                    colorsArray[index] = 0.04 + Math.random() * 0.04;     
                    colorsArray[index + 1] = 0.28 + Math.random() * 0.08; 
                    colorsArray[index + 2] = 0.06 + Math.random() * 0.04; 
                }
                index += 3;
            }
        }
        
        // Fill remaining tree points with leaf points
        while (index < maxPoints) {
            const tip = tips[Math.floor(Math.random() * tips.length)];
            const radius = 5.0 + Math.random() * 5.0;
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            
            positionsArray[index] = tip.x + radius * Math.sin(phi) * Math.cos(theta);
            positionsArray[index + 1] = tip.y + radius * Math.sin(phi) * Math.sin(theta);
            positionsArray[index + 2] = tip.z + radius * Math.cos(phi);
            
            colorsArray[index] = 0.08 + Math.random() * 0.08;
            colorsArray[index + 1] = 0.44 + Math.random() * 0.16;
            colorsArray[index + 2] = 0.12 + Math.random() * 0.08;
            index += 3;
        }
    }

    // Splitting particles:
    // Forest: 42% (Rich detailed trees)
    // Sea/Water floor: 22%
    // Mountains: 18%
    // Clouds: 13%
    // Stars & Moon: 5%
    const forestCount = Math.floor(particleCount * 0.42);
    const seaCount = Math.floor(particleCount * 0.22);
    const mountainCount = Math.floor(particleCount * 0.18);
    const cloudCount = Math.floor(particleCount * 0.13);
    const starCount = particleCount - (forestCount + seaCount + mountainCount + cloudCount);

    // 1. Forest Particle Generation (Detailed procedural trees)
    const forestGeometry = new THREE.BufferGeometry();
    const forestPositions = new Float32Array(forestCount * 3);
    const forestColors = new Float32Array(forestCount * 3);

    const treeCount = isMobile ? 30 : 65; // High tree count for dense forest corridor
    const pointsPerTree = Math.floor(forestCount / treeCount);
    let forestIdx = 0;

    for (let t = 0; t < treeCount; t++) {
        // Space trees along the entire path (z from 0 to -3000)
        const treeZ = -t * (3000 / treeCount) - Math.random() * 20;
        const pathX = getPathX(treeZ);
        const isLeft = t % 2 === 0;
        // Place trees much closer to the path for an immersive corridor fly-through
        const treeX = pathX + (isLeft ? -15 - Math.random() * 35 : 15 + Math.random() * 35);

        // Generate detailed tree (recursive branches + dense tips leaves)
        generateTreePoints(treeX, treeZ, pointsPerTree, forestPositions, forestColors, forestIdx);
        forestIdx += pointsPerTree * 3;
    }

    // Fill remaining forest points with ambient ground/land points
    while (forestIdx < forestCount * 3) {
        const z = -Math.random() * 3200;
        const pathX = getPathX(z);
        const x = pathX + (Math.random() - 0.5) * 120;
        const y = -25 + (Math.random() - 0.5) * 2; // ground level at y=-25

        forestPositions[forestIdx] = x;
        forestPositions[forestIdx + 1] = y;
        forestPositions[forestIdx + 2] = z;

        forestColors[forestIdx] = 0.10 + Math.random() * 0.08;
        forestColors[forestIdx + 1] = 0.28 + Math.random() * 0.10;
        forestColors[forestIdx + 2] = 0.12 + Math.random() * 0.08;
        forestIdx += 3;
    }

    forestGeometry.setAttribute('position', new THREE.BufferAttribute(forestPositions, 3));
    forestGeometry.setAttribute('color', new THREE.BufferAttribute(forestColors, 3));

    const forestMaterial = new THREE.PointsMaterial({
        size: isMobile ? 3.2 : 3.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.86,
        sizeAttenuation: true,
        map: createCircleTexture(),
        alphaTest: 0.01,
        depthWrite: false,
        blending: THREE.NormalBlending
    });

    const forestPoints = new THREE.Points(forestGeometry, forestMaterial);
    scene.add(forestPoints);

    // 2. Sea/Water Floor Particle Generation (Placed at the very bottom, y=-40)
    const seaGeometry = new THREE.BufferGeometry();
    const seaPositions = new Float32Array(seaCount * 3);
    const seaColors = new Float32Array(seaCount * 3);
    let seaIdx = 0;

    for (let s = 0; s < seaCount; s++) {
        const z = -Math.random() * 3200;
        const pathX = getPathX(z);
        const x = (Math.random() - 0.5) * 950 + pathX; // wide sea floor
        const y = -40 + Math.sin(x * 0.02) * Math.cos(z * 0.025) * 8; // bottom-most sea floor at y=-40

        seaPositions[seaIdx] = x;
        seaPositions[seaIdx + 1] = y;
        seaPositions[seaIdx + 2] = z;

        const rType = Math.random();
        if (rType < 0.65) {
            // Glowing cyan/blue sea water
            seaColors[seaIdx] = 0.0;
            seaColors[seaIdx + 1] = 0.65 + Math.random() * 0.25; 
            seaColors[seaIdx + 2] = 0.80 + Math.random() * 0.20; 
        } else if (rType < 0.88) {
            // Deep aquatic blue
            seaColors[seaIdx] = 0.05;
            seaColors[seaIdx + 1] = 0.25 + Math.random() * 0.15;
            seaColors[seaIdx + 2] = 0.60 + Math.random() * 0.20;
        } else {
            // Mossy banks/reef highlights
            seaColors[seaIdx] = 0.10 + Math.random() * 0.10;
            seaColors[seaIdx + 1] = 0.40 + Math.random() * 0.10;
            seaColors[seaIdx + 2] = 0.25 + Math.random() * 0.10;
        }
        seaIdx += 3;
    }

    seaGeometry.setAttribute('position', new THREE.BufferAttribute(seaPositions, 3));
    seaGeometry.setAttribute('color', new THREE.BufferAttribute(seaColors, 3));

    const seaMaterial = new THREE.PointsMaterial({
        size: isMobile ? 2.5 : 3.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
        map: createCircleTexture(),
        alphaTest: 0.01,
        depthWrite: false,
        blending: THREE.NormalBlending
    });

    const seaPoints = new THREE.Points(seaGeometry, seaMaterial);
    scene.add(seaPoints);

    // 3. Mountain Ranges Particle Generation (Background/Sides, y=-30 to y=60)
    const mountainGeometry = new THREE.BufferGeometry();
    const mountainPositions = new Float32Array(mountainCount * 3);
    const mountainColors = new Float32Array(mountainCount * 3);
    let mountainIdx = 0;

    const numMountains = 8; // More mountains for a full valley effect
    const pointsPerMountain = Math.floor(mountainCount / numMountains);

    for (let m = 0; m < numMountains; m++) {
        // Space mountains along flight depth
        const z_center = -m * 420 - Math.random() * 100 - 150;
        const pathX = getPathX(z_center);
        const isLeft = m % 2 === 0;
        const x_center = pathX + (isLeft ? -200 - Math.random() * 80 : 200 + Math.random() * 80);
        const baseRadius = 180 + Math.random() * 100;
        const peakHeight = 75 + Math.random() * 20; // peaks up to y=65 (under the clouds!)

        for (let p = 0; p < pointsPerMountain; p++) {
            const theta = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * baseRadius; // Uniform disk sampling
            const px = x_center + Math.cos(theta) * r;
            const pz = z_center + Math.sin(theta) * r;
            const heightFactor = 1.0 - r / baseRadius;
            
            // Cone shape + rugged noise
            const rawHeight = peakHeight * heightFactor;
            const roughness = (Math.random() - 0.5) * 8 * (0.3 + heightFactor);
            const py = -30 + rawHeight + roughness; // Base starts at y=-30

            mountainPositions[mountainIdx] = px;
            mountainPositions[mountainIdx + 1] = py;
            mountainPositions[mountainIdx + 2] = pz;

            // Colors transition: peak warm gold/pink -> slate stone gray -> dark mossy base
            if (py > 25) {
                // Peak sunset glow
                mountainColors[mountainIdx] = 0.85 + Math.random() * 0.10;     
                mountainColors[mountainIdx + 1] = 0.65 + Math.random() * 0.15; 
                mountainColors[mountainIdx + 2] = 0.50 + Math.random() * 0.15; 
            } else if (py > -5) {
                // Slate gray stone
                mountainColors[mountainIdx] = 0.35 + Math.random() * 0.10;
                mountainColors[mountainIdx + 1] = 0.36 + Math.random() * 0.10;
                mountainColors[mountainIdx + 2] = 0.38 + Math.random() * 0.10;
            } else {
                // Moss/earth base
                mountainColors[mountainIdx] = 0.12 + Math.random() * 0.08;
                mountainColors[mountainIdx + 1] = 0.28 + Math.random() * 0.12;
                mountainColors[mountainIdx + 2] = 0.14 + Math.random() * 0.08;
            }
            mountainIdx += 3;
        }
    }

    // Fill remaining mountain points
    while (mountainIdx < mountainCount * 3) {
        mountainPositions[mountainIdx] = (Math.random() - 0.5) * 800;
        mountainPositions[mountainIdx + 1] = -30;
        mountainPositions[mountainIdx + 2] = -Math.random() * 3200;
        mountainColors[mountainIdx] = 0.12;
        mountainColors[mountainIdx + 1] = 0.25;
        mountainColors[mountainIdx + 2] = 0.14;
        mountainIdx += 3;
    }

    mountainGeometry.setAttribute('position', new THREE.BufferAttribute(mountainPositions, 3));
    mountainGeometry.setAttribute('color', new THREE.BufferAttribute(mountainColors, 3));

    const mountainMaterial = new THREE.PointsMaterial({
        size: isMobile ? 3.0 : 3.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.86,
        sizeAttenuation: true,
        map: createCircleTexture(),
        alphaTest: 0.01,
        depthWrite: false,
        blending: THREE.NormalBlending
    });

    const mountainPoints = new THREE.Points(mountainGeometry, mountainMaterial);
    scene.add(mountainPoints);

    // 4. Cloud Formations Particle Generation (High floating sky, y=95 to y=150)
    const cloudGeometry = new THREE.BufferGeometry();
    const cloudPositions = new Float32Array(cloudCount * 3);
    const cloudColors = new Float32Array(cloudCount * 3);
    let cloudIdx = 0;

    const numClouds = isMobile ? 6 : 12; // More clouds for sky landscape
    const pointsPerCloud = Math.floor(cloudCount / numClouds);

    for (let c = 0; c < numClouds; c++) {
        const z_center = -c * 270 - Math.random() * 80 - 100;
        const pathX = getPathX(z_center);
        const x_center = pathX + (Math.random() - 0.5) * 450;
        const y_center = 95 + Math.random() * 35; // Clouds strictly at y=95 to y=130

        // A cloud is made of 5 overlapping blobs
        const numBlobs = 5;
        const pointsPerBlob = Math.floor(pointsPerCloud / numBlobs);

        for (let b = 0; b < numBlobs; b++) {
            const bx = x_center + (Math.random() - 0.5) * 45;
            const by = y_center + (Math.random() - 0.5) * 12;
            const bz = z_center + (Math.random() - 0.5) * 45;
            const blobRadius = 22 + Math.random() * 18;

            for (let p = 0; p < pointsPerBlob; p++) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2.0 * Math.random() - 1.0);
                const r = Math.sqrt(Math.random()) * blobRadius;

                const px = bx + r * Math.sin(phi) * Math.cos(theta);
                const py = by + r * Math.sin(phi) * Math.sin(theta);
                const pz = bz + r * Math.cos(phi);

                cloudPositions[cloudIdx] = px;
                cloudPositions[cloudIdx + 1] = py;
                cloudPositions[cloudIdx + 2] = pz;

                // Soft white/cream cloud color
                const brightness = 0.85 + Math.random() * 0.15;
                cloudColors[cloudIdx] = brightness;
                cloudColors[cloudIdx + 1] = brightness * 0.96;
                cloudColors[cloudIdx + 2] = brightness * 0.90;

                cloudIdx += 3;
            }
        }
    }

    // Fill remaining cloud points
    while (cloudIdx < cloudCount * 3) {
        cloudPositions[cloudIdx] = (Math.random() - 0.5) * 600;
        cloudPositions[cloudIdx + 1] = 120 + Math.random() * 30;
        cloudPositions[cloudIdx + 2] = -Math.random() * 3200;
        cloudColors[cloudIdx] = 0.90;
        cloudColors[cloudIdx + 1] = 0.88;
        cloudColors[cloudIdx + 2] = 0.85;
        cloudIdx += 3;
    }

    cloudGeometry.setAttribute('position', new THREE.BufferAttribute(cloudPositions, 3));
    cloudGeometry.setAttribute('color', new THREE.BufferAttribute(cloudColors, 3));

    const cloudMaterial = new THREE.PointsMaterial({
        size: isMobile ? 3.8 : 4.6, // larger points for volumetric look
        vertexColors: true,
        transparent: true,
        opacity: 0.88,
        sizeAttenuation: true,
        map: createCircleTexture(),
        alphaTest: 0.01,
        depthWrite: false,
        blending: THREE.NormalBlending
    });

    const cloudPoints = new THREE.Points(cloudGeometry, cloudMaterial);
    scene.add(cloudPoints);

    // 5. Stars & Moon Particle Generation (Very top of sky, y > 155)
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const moonCountVal = isMobile ? 250 : 600;
    const moonCenterPoint = { x: -95, y: 145, z: -1700 }; // Moon placed high up at y=145
    const rMoon1 = 18;
    const moonOffsetX = 8;
    const moonOffsetY = 6;
    const rMoon2 = 18;

    let starIdx = 0;

    // Generate Point-Cloud Crescent Moon
    for (let m = 0; m < moonCountVal; m++) {
        let px, py, pz;
        let found = false;
        for (let attempt = 0; attempt < 200; attempt++) {
            const rx = (Math.random() - 0.5) * rMoon1 * 2;
            const ry = (Math.random() - 0.5) * rMoon1 * 2;
            if (rx * rx + ry * ry <= rMoon1 * rMoon1) {
                const shadowX = rx - moonOffsetX;
                const shadowY = ry - moonOffsetY;
                if (shadowX * shadowX + shadowY * shadowY > rMoon2 * rMoon2) {
                    px = moonCenterPoint.x + rx;
                    py = moonCenterPoint.y + ry;
                    pz = moonCenterPoint.z + (Math.random() - 0.5) * 8;
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * rMoon1;
            px = moonCenterPoint.x + Math.cos(angle) * r;
            py = moonCenterPoint.y + Math.sin(angle) * r;
            pz = moonCenterPoint.z + (Math.random() - 0.5) * 8;
        }

        starPositions[starIdx] = px;
        starPositions[starIdx + 1] = py;
        starPositions[starIdx + 2] = pz;

        // Glowing warm white/gold moon
        starColors[starIdx] = 0.98 + Math.random() * 0.02;
        starColors[starIdx + 1] = 0.95 + Math.random() * 0.05;
        starColors[starIdx + 2] = 0.85 + Math.random() * 0.15;

        starIdx += 3;
    }

    // Generate Sky Stars (strictly in the highest sky region, y > 155)
    while (starIdx < starCount * 3) {
        const z = -Math.random() * 3200;
        const pathX = getPathX(z);
        
        starPositions[starIdx] = (Math.random() - 0.5) * 750 + pathX;
        starPositions[starIdx + 1] = 155 + Math.random() * 180; // sky space from y=155 up to y=335
        starPositions[starIdx + 2] = z;
        
        const rType = Math.random();
        const brightness = 0.65 + Math.random() * 0.35;
        
        if (rType < 0.4) {
            // White stars
            starColors[starIdx] = brightness;
            starColors[starIdx + 1] = brightness;
            starColors[starIdx + 2] = brightness;
        } else if (rType < 0.8) {
            // Soft gold stars
            starColors[starIdx] = brightness;
            starColors[starIdx + 1] = brightness * (0.88 + Math.random() * 0.12);
            starColors[starIdx + 2] = brightness * (0.65 + Math.random() * 0.2);
        } else {
            // Soft cyan stars
            starColors[starIdx] = brightness * (0.68 + Math.random() * 0.2);
            starColors[starIdx + 1] = brightness * (0.88 + Math.random() * 0.12);
            starColors[starIdx + 2] = brightness;
        }
        
        starIdx += 3;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: isMobile ? 1.3 : 1.6,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        sizeAttenuation: true,
        map: createCircleTexture(),
        alphaTest: 0.01,
        depthWrite: false,
        blending: THREE.AdditiveBlending // Glow effect in the dark sky!
    });

    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    // Pointer-interactive parallax offsets (mouse tracking)
    let mouseX = 0;
    let mouseY = 0;

    if (!isMobile) {
        window.addEventListener('pointermove', (event) => {
            mouseX = (event.clientX / window.innerWidth - 0.5) * 25;
            mouseY = (0.5 - event.clientY / window.innerHeight) * 18;
        }, { passive: true });
    }

    // Scroll-bound winding path camera flight spanning the entire body height
    gsap.to(camera.position, {
        z: -3100,
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: isMobile ? 0.75 : 1.25
        }
    });

    // Day-to-night background color and Three.js fog color transition as we scroll past #home
    const fogColorHex = { val: "#050c0e" };
    gsap.to(fogColorHex, {
        val: "#f6efe3",
        scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom top",
            scrub: true,
            onUpdate: () => {
                scene.fog.color.set(fogColorHex.val);
            }
        }
    });

    gsap.to(".canvas-dark-overlay", {
        opacity: 0,
        scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Render loop
    const animateScene = () => {
        if (state.isCanvasVisible) {
            const currentZ = camera.position.z;
            const pathCenterX = getPathX(currentZ);
            const pathCenterY = getCameraY(currentZ);
            
            // Target camera position with mouse parallax offsets
            const targetX = pathCenterX + mouseX;
            const targetY = pathCenterY + mouseY;

            // Store previous camera X to compute roll bank angle
            const oldX = camera.position.x;

            camera.position.x += (targetX - camera.position.x) * 0.058;
            camera.position.y += (targetY - camera.position.y) * 0.058;

            // Camera look target with lead and subtle upward tilt offset (+10)
            const lookAheadZ = currentZ - 90;
            const lookAheadX = getPathX(lookAheadZ);
            const lookAheadY = getCameraY(lookAheadZ) + 10;
            
            camera.lookAt(lookAheadX, lookAheadY, lookAheadZ);

            // Compute airplane/drone banking (roll) based on horizontal change
            const roll = -(camera.position.x - oldX) * 0.16;
            camera.rotation.z = Math.max(-0.25, Math.min(0.25, roll)); // Clamp bank roll angle to ~14 degrees

            // Slow organic drifts
            forestPoints.rotation.z += 0.00010;
            cloudPoints.rotation.z -= 0.00004;
            starPoints.rotation.z -= 0.00003;
            starPoints.rotation.y += 0.00002;

            // Animate dynamic sea waves ripples on the sea floor geometry
            const time = Date.now() * 0.0018;
            const seaPositionsArray = seaGeometry.attributes.position.array;
            
            for (let s = 0; s < seaCount; s++) {
                const idx = s * 3;
                const px = seaPositionsArray[idx];
                const pz = seaPositionsArray[idx + 2];
                seaPositionsArray[idx + 1] = -40 + Math.sin(px * 0.03 + time) * Math.cos(pz * 0.035 + time) * 2.0; // water waves centered at y=-40
            }
            seaGeometry.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
        }
        window.requestAnimationFrame(animateScene);
    };

    animateScene();
}

document.addEventListener('DOMContentLoaded', () => {
    syncMotionPreferences();
    initNavigation();
    initReveal();
    initActiveSectionTracking();
    initCursor();
    initMagnetic();
    initTilt();
    initAmbientParallax();
    initEasterEgg();
    initMediaListeners();
    initThreeParticles();
    updateNavbar();

    window.addEventListener('scroll', updateNavbar, { passive: true });
});
