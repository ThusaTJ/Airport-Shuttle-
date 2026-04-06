/* ═══════════════════════════════════════════════════════
   AIRPORT SHUTTLE — script.js
   All page interactions + Google Translate (merged, no duplicates)
════════════════════════════════════════════════════════ */

'use strict';


/* ──────────────────────────────────────────────────────
   GOOGLE TRANSLATE — load widget + helpers
   Defined first so initTranslate() can call them.
────────────────────────────────────────────────────── */

/* Boot the Google Translate element once the script loads */
window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false, includedLanguages: 'en,es,fr,de' },
        'google_translate_element'
    );
};

/* Load Google's script once per page */
(function loadGT() {
    if (document.getElementById('gt-script')) return;
    const s  = document.createElement('script');
    s.id     = 'gt-script';
    s.async  = true;
    s.src    = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(s);
})();

/* Fire Google's hidden <select> — polls until widget is ready */
function doTranslate(lang) {
    let tries = 0;
    const t = setInterval(() => {
        tries++;
        const sel = document.querySelector('.goog-te-combo');
        if (sel) {
            clearInterval(t);
            sel.value = lang;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            sel.dispatchEvent(new Event('input',  { bubbles: true }));
        }
        if (tries > 50) clearInterval(t);
    }, 100);
}

/* Clear Google cookie and reload to restore English */
function resetToEnglish() {
    ['', '.' + location.hostname].forEach(d => {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${d};`;
    });
    localStorage.removeItem('gbvp_lang');
    localStorage.removeItem('gbvp_lang_label');
    location.replace(location.href.replace(/#googtrans\([^)]*\)/g, ''));
}

/* On page load: restore the language the user previously picked */
function restoreLang() {
    const lang  = localStorage.getItem('gbvp_lang');
    const label = localStorage.getItem('gbvp_lang_label');
    if (!lang || lang === 'en') return;

    const el = document.getElementById('currentLang');
    if (el) el.textContent = label || lang.toUpperCase();

    document.querySelectorAll('.lang-opt').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === lang);
    });

    /* Wait for Google widget to finish initialising before triggering */
    setTimeout(() => doTranslate(lang), 900);
}


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
        updateActiveLink();
        return;
    }
    mainNav.dataset.navInitialized = 'true';

    const mobileNavQuery = window.matchMedia('(max-width: 1150px)');
    let lastScrollY = window.scrollY;

    function resetNavMenu() {
        navLinks.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => {
            s.style.transform = '';
            s.style.opacity   = '';
        });
        document.body.style.overflow = '';
    }

    function handleScroll() {
        const sy = window.scrollY;

        if (sy > 60 && sy > lastScrollY) {
            topbar.classList.add('hidden');
            translateWrap && translateWrap.classList.remove('open');
            mainNav.classList.add('topbar-hidden');
        } else {
            topbar.classList.remove('hidden');
            mainNav.classList.remove('topbar-hidden');
        }

        mainNav.classList.toggle('scrolled', sy > 20);
        if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', sy > 400);

        lastScrollY = sy;
        updateActiveLink();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    function updateActiveLink() {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link[href]').forEach(a => {
            const href = a.getAttribute('href').split('#')[0];
            a.classList.toggle('active', href === page);
        });
    }
    updateActiveLink();

    /* Hamburger */
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

    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', resetNavMenu));

    document.addEventListener('click', function (e) {
        if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            resetNavMenu();
        }
    });

    document.querySelectorAll('.nav-has-drop > .nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            if (mobileNavQuery.matches) {
                e.preventDefault();
                link.closest('.nav-has-drop').classList.toggle('drop-open');
            }
        });
    });

    const onBreakpointChange = e => { if (!e.matches) resetNavMenu(); };
    typeof mobileNavQuery.addEventListener === 'function'
        ? mobileNavQuery.addEventListener('change', onBreakpointChange)
        : window.addEventListener('resize', () => onBreakpointChange(mobileNavQuery));

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    handleScroll();
}


/* ──────────────────────────────────────────────────────
   2. TRANSLATE WIDGET  (unified — no duplicate listeners)
────────────────────────────────────────────────────── */
function initTranslate() {
    const wrap  = document.getElementById('translateWrap');
    const btn   = document.getElementById('translateBtn');
    const dd    = document.getElementById('translateDropdown');
    const label = document.getElementById('currentLang');

    if (!wrap || !btn || !dd) return;
    if (wrap.dataset.translateInitialized === 'true') return;
    wrap.dataset.translateInitialized = 'true';

    /* Toggle dropdown */
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        wrap.classList.toggle('open');
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
        if (!wrap.contains(e.target)) wrap.classList.remove('open');
    });

    /* Language pill clicks */
    dd.querySelectorAll('.lang-opt').forEach(pill => {
        pill.addEventListener('click', function () {
            const lang  = pill.dataset.lang;          /* lowercase: 'en','es','fr','de' */
            const lbl   = pill.dataset.label || lang.toUpperCase();

            dd.querySelectorAll('.lang-opt').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            if (label) label.textContent = lbl;
            wrap.classList.remove('open');

            if (lang === 'en') {
                resetToEnglish();
            } else {
                localStorage.setItem('gbvp_lang', lang);
                localStorage.setItem('gbvp_lang_label', lbl);
                doTranslate(lang);
            }
        });
    });

    /* Restore language chosen on a previous page */
    restoreLang();
}


/* ──────────────────────────────────────────────────────
   SITE CHROME ENTRY POINT
   Called by each page after navbar.html + footer.html
   are fetched and injected.
────────────────────────────────────────────────────── */
window.initializeSiteChrome = function () {
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
            left:${Math.random() * 100}%;
            top:${Math.random() * 100}%;
            --dur:${6 + Math.random() * 10}s;
            --delay:${Math.random() * 8}s;
            --dx:${(Math.random() - .5) * 60}px;
            width:${2 + Math.random() * 3}px;
            height:${2 + Math.random() * 3}px;
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
    const target     = parseInt(el.dataset.target, 10);
    const suffix     = el.dataset.suffix || '';
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
        entries.forEach(e => {
            if (e.isIntersecting) { animateCounter(e.target); io.unobserve(e.target); }
        });
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

    const closeAll = () => {
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
            closeAll();
            if (!isOpen) {
                item.classList.add('open');
                answer.classList.add('open');
                answer.style.maxHeight = `${answer.scrollHeight}px`;
            }
        });
    });

    window.addEventListener('resize', () => {
        const open = faqList.querySelector('.faq-item.open .faq-a');
        if (open) open.style.maxHeight = `${open.scrollHeight}px`;
    }, { passive: true });
}


/* ──────────────────────────────────────────────────────
   8. QUOTE & CONTACT BUTTONS
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
        fnBtn.textContent      = '✓ Subscribed!';
        fnBtn.style.background = '#2ecc71';
        fnInput.value          = '';
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
        const pt    = path.getPointAtLength((t / 100) * pathLen);
        const pt2   = path.getPointAtLength(((t + .5) / 100) * pathLen);
        const angle   = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;
        const opacity = t < 5 ? t / 5 : t > 90 ? (100 - t) / 10 : 0.5;
        plane.setAttribute('transform', `translate(${pt.x},${pt.y}) rotate(${angle})`);
        plane.style.opacity = opacity;
        requestAnimationFrame(step);
    })();
}


/* ──────────────────────────────────────────────────────
   BOOT — runs on DOMContentLoaded
────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    /* initializeSiteChrome() is also called by each page's
       fetch() promise after navbar/footer are injected —
       the guard flags inside initNav() and initTranslate()
       prevent any function from running twice. */
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