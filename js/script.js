/* ═══════════════════════════════════════════════════════
   AIRPORT SHUTTLE — script.js (Merged)
   Handles all page interactions + navbar/footer logic
════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────
   1. NAVBAR & TOPBAR BEHAVIOUR
────────────────────────────────────────────────────── */
function initNav() {
    const topbar       = document.getElementById('topbar');
    const mainNav      = document.getElementById('mainNav');
    const hamburger    = document.getElementById('hamburger');
    const navLinks     = document.getElementById('navLinks');
    const translateWrap = document.getElementById('translateWrap');
    const scrollTopBtn = document.getElementById('scrollTop');
    if (!topbar || !mainNav || !hamburger || !navLinks) return;
    if (mainNav.dataset.navInitialized === 'true') {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link[href]').forEach(a => {
            const href = a.getAttribute('href').split('#')[0];
            a.classList.toggle('active', href === page);
        });
        return;
    }
    mainNav.dataset.navInitialized = 'true';
    const mobileNavQuery = window.matchMedia('(max-width: 1150px)');
    let lastScrollY    = window.scrollY;

    function resetNavMenu() {
        if (!navLinks || !hamburger) return;
        navLinks.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => {
            s.style.transform = '';
            s.style.opacity   = '';
        });
        document.body.style.overflow = '';
    }

    /* ── Scroll: topbar hide + nav shadow + scroll-to-top ── */
    function handleScroll() {
        const sy = window.scrollY;

        if (topbar) {
            if (sy > 60 && sy > lastScrollY) {
                topbar.classList.add('hidden');
                translateWrap && translateWrap.classList.remove('open');
                mainNav && mainNav.classList.add('topbar-hidden');
            } else {
                topbar.classList.remove('hidden');
                mainNav && mainNav.classList.remove('topbar-hidden');
            }
        }

        if (mainNav) mainNav.classList.toggle('scrolled', sy > 20);
        if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', sy > 400);

        lastScrollY = sy;
        updateActiveLink();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    /* ── Active link spy ── */
    function updateActiveLink() {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link[href]').forEach(a => {
            const href = a.getAttribute('href').split('#')[0];
            a.classList.toggle('active', href === page);
        });
    }
    updateActiveLink();

    /* ── Hamburger toggle ── */
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('open');
            const spans  = hamburger.querySelectorAll('span');
            document.body.style.overflow = isOpen ? 'hidden' : '';
            if (isOpen) {
                spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
                spans[1].style.opacity   = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
            } else {
                spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
            }
        });

        /* Close when a link is clicked */
        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', resetNavMenu);
        });

        /* Close when clicking outside */
        document.addEventListener('click', function (e) {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                resetNavMenu();
            }
        });

        /* Mobile dropdown toggles */
        document.querySelectorAll('.nav-has-drop > .nav-link').forEach(link => {
            link.addEventListener('click', function (e) {
                if (mobileNavQuery.matches) {
                    e.preventDefault();
                    link.closest('.nav-has-drop').classList.toggle('drop-open');
                }
            });
        });

        const handleNavBreakpointChange = (event) => {
            if (!event.matches) resetNavMenu();
        };

        if (typeof mobileNavQuery.addEventListener === 'function') {
            mobileNavQuery.addEventListener('change', handleNavBreakpointChange);
        } else {
            window.addEventListener('resize', () => handleNavBreakpointChange(mobileNavQuery));
        }
    }

    /* ── Scroll to top ── */
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    handleScroll();
}


/* ──────────────────────────────────────────────────────
   2. TRANSLATE WIDGET
────────────────────────────────────────────────────── */
function initTranslate() {
    const translateBtn      = document.getElementById('translateBtn');
    const translateWrap     = document.getElementById('translateWrap');
    const currentLangEl     = document.getElementById('currentLang');
    const langOpts          = document.querySelectorAll('.lang-opt');

    if (!translateBtn || !translateWrap) return;
    if (translateWrap.dataset.translateInitialized === 'true') return;
    translateWrap.dataset.translateInitialized = 'true';

    /* Toggle on button click */
    translateBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        translateWrap.classList.toggle('open');
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
        if (!translateWrap.contains(e.target)) {
            translateWrap.classList.remove('open');
        }
    });

    /* Language select */
    langOpts.forEach(btn => {
        btn.addEventListener('click', function () {
            const lang = btn.dataset.lang;
            if (currentLangEl) currentLangEl.textContent = lang;
            langOpts.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            translateWrap.classList.remove('open');

            /* Hook into Google Translate if present */
            try {
                const gtCombo = document.querySelector('.goog-te-combo');
                if (gtCombo) {
                    const map = { EN:'en', ES:'es', FR:'fr', DE:'de', ZH:'zh-CN', AR:'ar', PT:'pt' };
                    gtCombo.value = map[lang] || 'en';
                    gtCombo.dispatchEvent(new Event('change'));
                }
            } catch (_) {}
        });
    });
}

window.initializeSiteChrome = function initializeSiteChrome() {
    initNav();
    initTranslate();
};


/* ──────────────────────────────────────────────────────
   3. PARTICLES
────────────────────────────────────────────────────── */
function initParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.cssText = `
            left:${Math.random()*100}%;
            top:${Math.random()*100}%;
            --dur:${6+Math.random()*10}s;
            --delay:${Math.random()*8}s;
            --dx:${(Math.random()-.5)*60}px;
            width:${2+Math.random()*3}px;
            height:${2+Math.random()*3}px;
        `;
        container.appendChild(p);
    }
}


/* ──────────────────────────────────────────────────────
   4. SCROLL-REVEAL
────────────────────────────────────────────────────── */
function initScrollReveal() {
    const els = document.querySelectorAll('.scroll-reveal');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
}


/* ──────────────────────────────────────────────────────
   5. ANIMATED COUNTERS
────────────────────────────────────────────────────── */
function animateCounter(el) {
    const target    = parseInt(el.dataset.target, 10);
    const suffix    = el.dataset.suffix || '';
    const totalSteps = 2000 / 16;
    let current = 0;
    const timer = setInterval(() => {
        current += target / totalSteps;
        if (current >= target) { clearInterval(timer); current = target; }
        el.textContent = target >= 1000
            ? Math.round(current / 1000) + 'K+'
            : Math.round(current) + suffix;
    }, 16);
}

function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(c => io.observe(c));
}


/* ──────────────────────────────────────────────────────
   6. BOOKING FORM TABS
────────────────────────────────────────────────────── */
function initFormTabs() {
    document.querySelectorAll('.form-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.form-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}


/* ──────────────────────────────────────────────────────
   7. FAQ ACCORDION
────────────────────────────────────────────────────── */
function initFAQ() {
    const faqList = document.getElementById('faqList');
    if (!faqList) return;

    const closeAllItems = () => {
        faqList.querySelectorAll('.faq-item').forEach(i => {
            const panel = i.querySelector('.faq-a');
            i.classList.remove('open');
            panel.classList.remove('open');
            panel.style.maxHeight = '0px';
        });
    };

    faqList.querySelectorAll('.faq-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const item   = btn.closest('.faq-item');
            const answer = item.querySelector('.faq-a');
            const isOpen = item.classList.contains('open');
            closeAllItems();
            if (!isOpen) {
                item.classList.add('open');
                answer.classList.add('open');
                answer.style.maxHeight = `${answer.scrollHeight}px`;
            }
        });
    });

    window.addEventListener('resize', () => {
        const openAnswer = faqList.querySelector('.faq-item.open .faq-a');
        if (openAnswer) openAnswer.style.maxHeight = `${openAnswer.scrollHeight}px`;
    }, { passive: true });
}


/* ──────────────────────────────────────────────────────
   8. QUOTE & CONTACT BUTTONS (mock feedback)
────────────────────────────────────────────────────── */
function initButtons() {
    function flashBtn(btn, msg) {
        if (!btn) return;
        const original = btn.innerHTML;
        btn.innerHTML  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg> ${msg}`;
        btn.style.background = '#2ecc71';
        btn.style.color      = 'white';
        setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; btn.style.color = ''; }, 3500);
    }

    const quoteBtn  = document.getElementById('quoteBtn');
    const submitBtn = document.getElementById('submitBtn');
    if (quoteBtn)  quoteBtn.addEventListener('click',  () => flashBtn(quoteBtn,  'Quote Sent to Your Email!'));
    if (submitBtn) submitBtn.addEventListener('click', () => flashBtn(submitBtn, 'Message Sent!'));
}


/* ──────────────────────────────────────────────────────
   9. FOOTER NEWSLETTER
────────────────────────────────────────────────────── */
function initNewsletter() {
    const fnBtn   = document.querySelector('.fn-btn');
    const fnInput = document.querySelector('.fn-form input');
    if (!fnBtn || !fnInput) return;
    fnBtn.addEventListener('click', () => {
        if (!fnInput.value.trim()) {
            fnInput.style.borderColor = '#e74c3c';
            setTimeout(() => fnInput.style.borderColor = '', 2000);
            return;
        }
        fnBtn.textContent    = '✓ Subscribed!';
        fnBtn.style.background = '#2ecc71';
        fnInput.value = '';
        setTimeout(() => { fnBtn.textContent = 'Subscribe'; fnBtn.style.background = ''; }, 3500);
    });
}


/* ──────────────────────────────────────────────────────
   10. FLYING PLANE PATH ANIMATION
────────────────────────────────────────────────────── */
function initPlanePath() {
    const plane = document.getElementById('flyingPlane');
    const path  = document.getElementById('planePath');
    if (!plane || !path || !path.getTotalLength) return;
    const pathLen = path.getTotalLength();
    let t = 0;
    (function step() {
        t = (t + 0.3) % 100;
        const pt  = path.getPointAtLength((t / 100) * pathLen);
        const pt2 = path.getPointAtLength(((t + .5) / 100) * pathLen);
        const angle   = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;
        const opacity = t < 5 ? t / 5 : t > 90 ? (100 - t) / 10 : 0.5;
        plane.setAttribute('transform', `translate(${pt.x},${pt.y}) rotate(${angle})`);
        plane.style.opacity = opacity;
        requestAnimationFrame(step);
    })();
}


/* ──────────────────────────────────────────────────────
   INIT
────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    window.initializeSiteChrome();
    initParticles();
    initScrollReveal();
    initCounters();
    initFormTabs();
    initFAQ();
    initButtons();
    initNewsletter();
    initPlanePath();
});
