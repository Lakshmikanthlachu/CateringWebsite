/* =========================================================
   Bellavita Catering — Shared front-end behaviour
   Vanilla JS only — no dependencies
   ========================================================= */
(function () {
  'use strict';

  /* ---------------- Progressive enhancement flag ---------------- */
  document.documentElement.classList.remove('no-js');

  /* ---------------- Shared inline icon markup (no emoji, no external icon fonts) ---------------- */
  var ICON_SUN = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  var ICON_MOON = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  /* ---------------- Theme (dark / light) ---------------- */
  var THEME_KEY = 'bellavita-theme';
  function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function storeTheme(val) {
    try { localStorage.setItem(THEME_KEY, val); } catch (e) { /* storage unavailable, ignore */ }
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(function (btn) {
      btn.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }
  var initialTheme = getStoredTheme() || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(initialTheme);

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.theme-toggle');
    if (!btn) return;
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storeTheme(next);
  });

  /* ---------------- Direction (LTR / RTL) ---------------- */
  var DIR_KEY = 'bellavita-dir';
  function getStoredDir() {
    try { return localStorage.getItem(DIR_KEY); } catch (e) { return null; }
  }
  function storeDir(val) {
    try { localStorage.setItem(DIR_KEY, val); } catch (e) { /* ignore */ }
  }
  function applyDir(dir) {
    document.documentElement.setAttribute('dir', dir);
    var toggles = document.querySelectorAll('.rtl-toggle');
    toggles.forEach(function (btn) {
      btn.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
      btn.setAttribute('aria-label', dir === 'rtl' ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
      btn.setAttribute('title', dir === 'rtl' ? 'Switch to LTR' : 'Switch to RTL (Arabic / Hebrew preview)');
    });
  }
  var initialDir = getStoredDir() || 'ltr';
  applyDir(initialDir);

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.rtl-toggle');
    if (!btn) return;
    var current = document.documentElement.getAttribute('dir') || 'ltr';
    var next = current === 'rtl' ? 'ltr' : 'rtl';
    applyDir(next);
    storeDir(next);
  });

  /* ---------------- Sticky header shadow ---------------- */
  var header = document.querySelector('.site-header');
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------------- Mobile nav toggle ---------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('mobile-open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('mobile-open');
        navToggle.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------------- Dropdown nav item (click-to-toggle for touch / mobile accordion) ---------------- */
  document.querySelectorAll('.nav-item-dropdown').forEach(function (item) {
    var trigger = item.querySelector('.dropdown-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var willOpen = !item.classList.contains('open');
      document.querySelectorAll('.nav-item-dropdown.open').forEach(function (o) { if (o !== item) o.classList.remove('open'); });
      item.classList.toggle('open', willOpen);
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-item-dropdown')) {
      document.querySelectorAll('.nav-item-dropdown.open').forEach(function (o) { o.classList.remove('open'); });
    }
  });

  /* ---------------- Active nav link by current page ---------------- */
  (function highlightActive() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
        var dropdownParent = a.closest('.nav-item-dropdown');
        if (dropdownParent) {
          var trigger = dropdownParent.querySelector('.dropdown-trigger');
          if (trigger) trigger.classList.add('active');
        }
      }
    });
  })();

  /* ---------------- Back to top ---------------- */
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- Scroll reveal (IntersectionObserver) ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------------- 3D tilt on cards (mouse-follow) ---------------- */
  var tiltEls = document.querySelectorAll('.tilt');
  var supportsHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (supportsHover) {
    tiltEls.forEach(function (el) {
      var bounds;
      var maxTilt = parseFloat(el.getAttribute('data-tilt-max')) || 10;

      el.addEventListener('mouseenter', function () {
        bounds = el.getBoundingClientRect();
      });
      el.addEventListener('mousemove', function (e) {
        if (!bounds) bounds = el.getBoundingClientRect();
        var relX = (e.clientX - bounds.left) / bounds.width;
        var relY = (e.clientY - bounds.top) / bounds.height;
        var rotY = (relX - 0.5) * (maxTilt * 2);
        var rotX = (0.5 - relY) * (maxTilt * 2);
        el.style.transform = 'perspective(900px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) translateY(-6px) scale(1.015)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
      });
    });
  }

  /* ---------------- Hero visual gentle parallax on mousemove ---------------- */
  var stage = document.querySelector('.hero-visual .stage');
  if (stage && supportsHover) {
    document.querySelector('.hero') && document.querySelector('.hero').addEventListener('mousemove', function (e) {
      var w = window.innerWidth, h = window.innerHeight;
      var rx = ((e.clientY / h) - 0.5) * -10;
      var ry = ((e.clientX / w) - 0.5) * 14;
      stage.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
    });
  }

  /* ---------------- Tabs (menu.html) ---------------- */
  var tabBtns = document.querySelectorAll('.tab-btn');
  if (tabBtns.length) {
    function activateTab(target) {
      var btnMatch = document.querySelector('.tab-btn[data-tab="' + target + '"]');
      var panel = document.getElementById(target);
      if (!btnMatch || !panel) return false;
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      btnMatch.classList.add('active');
      panel.classList.add('active');
      return true;
    }
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () { activateTab(btn.getAttribute('data-tab')); });
    });
    if (window.location.hash) {
      activateTab(window.location.hash.replace('#', ''));
    }
  }

  /* ---------------- Gallery filter (gallery.html) ---------------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');
        document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('.gallery-item').forEach(function (item) {
          var cat = item.getAttribute('data-category');
          var show = filter === 'all' || cat === filter;
          item.classList.toggle('hide', !show);
        });
      });
    });
  }

  /* ---------------- Lightbox (gallery.html) ---------------- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  var lightbox = document.querySelector('.lightbox');
  if (galleryItems.length && lightbox) {
    var lbStage = lightbox.querySelector('.lightbox-stage');
    var lbCaption = lightbox.querySelector('.lightbox-caption');
    var lbIndex = 0;

    function renderLightbox() {
      var source = galleryItems[lbIndex].querySelector('.media-photo');
      if (source && lbStage) lbStage.innerHTML = source.outerHTML;
      var label = galleryItems[lbIndex].getAttribute('data-caption') || '';
      if (lbCaption) lbCaption.textContent = label;
    }
    function openLightbox(index) {
      lbIndex = index;
      renderLightbox();
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
    function showRelative(delta) {
      var visible = galleryItems.filter(function (item) { return !item.classList.contains('hide'); });
      var currentPos = visible.indexOf(galleryItems[lbIndex]);
      var nextPos = (currentPos + delta + visible.length) % visible.length;
      lbIndex = galleryItems.indexOf(visible[nextPos]);
      renderLightbox();
    }

    galleryItems.forEach(function (item, idx) {
      item.addEventListener('click', function () { openLightbox(idx); });
    });
    var closeBtn = lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', function () { showRelative(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { showRelative(1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showRelative(1);
      if (e.key === 'ArrowLeft') showRelative(-1);
    });
  }

  /* ---------------- Pricing guest-count toggle (packages.html) ---------------- */
  var guestToggleBtns = document.querySelectorAll('.tier-btn');
  if (guestToggleBtns.length) {
    guestToggleBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tab');
        document.querySelectorAll('.tier-btn').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.pricing-panel').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        var panel = document.getElementById(target);
        if (panel) panel.classList.add('active');
      });
    });
  }

  /* ---------------- Contact / quote form validation ---------------- */
  var quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var fields = quoteForm.querySelectorAll('[required]');
      fields.forEach(function (field) {
        var wrapper = field.closest('.field');
        var isEmpty = !field.value || !field.value.trim();
        var isBadEmail = field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        var isBadPhone = field.type === 'tel' && field.value && !/^[+\d][\d\s-]{6,}$/.test(field.value);
        var invalid = isEmpty || isBadEmail || isBadPhone;
        if (wrapper) wrapper.classList.toggle('invalid', invalid);
        if (invalid) valid = false;
      });

      if (!valid) {
        var firstInvalid = quoteForm.querySelector('.field.invalid input, .field.invalid select, .field.invalid textarea');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      quoteForm.style.display = 'none';
      var success = document.querySelector('.form-success');
      if (success) success.classList.add('show');
    });

    quoteForm.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        var wrapper = field.closest('.field');
        if (wrapper) wrapper.classList.remove('invalid');
      });
    });
  }

  /* ---------------- Newsletter / footer mini form (optional, all pages) ---------------- */
  var footerForm = document.getElementById('footerForm');
  if (footerForm) {
    footerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = footerForm.querySelector('input');
      var msg = footerForm.querySelector('.mini-msg');
      if (input && input.value.trim() && msg) {
        msg.textContent = 'Thanks! We\'ll be in touch shortly.';
        msg.style.display = 'block';
        input.value = '';
      }
    });
  }

  /* ---------------- Coming soon countdown (coming-soon.html) ---------------- */
  var countdownEl = document.querySelector('.countdown');
  if (countdownEl) {
    var target = new Date();
    target.setDate(target.getDate() + 21); // 3 weeks from load
    function tick() {
      var now = new Date();
      var diff = Math.max(0, target - now);
      var d = Math.floor(diff / (1000 * 60 * 60 * 24));
      var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      var m = Math.floor((diff / (1000 * 60)) % 60);
      var s = Math.floor((diff / 1000) % 60);
      var setVal = function (sel, val) {
        var el = countdownEl.querySelector(sel);
        if (el) el.textContent = String(val).padStart(2, '0');
      };
      setVal('.c-days', d);
      setVal('.c-hours', h);
      setVal('.c-mins', m);
      setVal('.c-secs', s);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------- Login/Register tab switch (login.html) ---------------- */
  var authTabBtns = document.querySelectorAll('.auth-tab-btn');
  if (authTabBtns.length) {
    function activateAuthTab(target) {
      var btnMatch = document.querySelector('.auth-tab-btn[data-tab="' + target + '"]');
      var panel = document.getElementById(target);
      if (!btnMatch || !panel) return false;
      document.querySelectorAll('.auth-tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.auth-panel').forEach(function (p) { p.classList.remove('active'); });
      btnMatch.classList.add('active');
      panel.classList.add('active');
      return true;
    }
    authTabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () { activateAuthTab(btn.getAttribute('data-tab')); });
    });
    if (window.location.hash) {
      activateAuthTab(window.location.hash.replace('#', ''));
    }
  }

  /* ---------------- Login form (demo — no backend) ---------------- */
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = loginForm.querySelector('.auth-demo-msg');
      if (msg) { msg.style.display = 'block'; }
    });
  }
  var registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = registerForm.querySelector('.auth-demo-msg');
      if (msg) { msg.style.display = 'block'; }
    });
  }

  /* ---------------- FAQ accordion (contact.html) ---------------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-question');
    if (!q) return;
    q.addEventListener('click', function () {
      var willOpen = !item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item.open').forEach(function (o) {
        if (o !== item) o.classList.remove('open');
      });
      item.classList.toggle('open', willOpen);
    });
  });

})();
