/* FertiClock one-pager: mobile menu + waitlist form. No dependencies. */
(function () {
  'use strict';

  /* ---------------- Config ---------------- */
  var CONFIG = {
    // Google Apps Script Web App URL (ends in /exec). Empty = form runs in demo mode.
    WAITLIST_ENDPOINT: 'https://script.google.com/macros/s/AKfycbyuPvcq7sqmndaBBTp0ZN4iwPtViKhXj06akeC4Ylqol-D6aCJueRiUKmkiog4zDg/exec',
    // Bump when the consent wording changes, so each sign-up records which text was agreed to.
    CONSENT_VERSION: 'v1-2026-11'
  };

  /* ---------------- Mobile menu ---------------- */
  var menu = document.getElementById('mobile-menu');
  var openBtn = document.getElementById('menu-open');
  var closeBtn = document.getElementById('menu-close');
  var lastFocus = null;

  function focusables() {
    return Array.prototype.slice.call(
      menu.querySelectorAll('a[href], button:not([disabled])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  function openMenu() {
    lastFocus = document.activeElement;
    menu.hidden = false;
    document.body.classList.add('menu-open');
    openBtn.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
    document.addEventListener('keydown', onMenuKey);
  }

  function closeMenu(restoreFocus) {
    menu.hidden = true;
    document.body.classList.remove('menu-open');
    openBtn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onMenuKey);
    if (restoreFocus !== false && lastFocus) lastFocus.focus();
  }

  function onMenuKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
    if (e.key !== 'Tab') return;
    var items = focusables();
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  if (menu && openBtn && closeBtn) {
    openBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', function () { closeMenu(); });
    menu.querySelectorAll('[data-menu-link]').forEach(function (link) {
      // Close first, then let the browser follow the anchor.
      link.addEventListener('click', function () { closeMenu(false); });
    });
    // If the viewport grows to desktop while the menu is open, release the scroll lock.
    window.matchMedia('(min-width: 1080px)').addEventListener('change', function (mq) {
      if (mq.matches && !menu.hidden) closeMenu(false);
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  // Elements fade up gently as they enter the viewport. Items in the same group are staggered.
  // Skipped entirely for reduced motion or old browsers, so content is never left hidden.
  var REVEAL_GROUPS = [
    '.section-head', '.faq-title', '.glance-list', '.stat-grid > *', '.factor-grid > *', '.gap-band',
    '.problem-grid > *', '.michelle-art', '.michelle-copy', '.steps > *', '.how-visual',
    '.definition', '.markers > *', '.curve-card', '.rule-band', '.compare-table-wrap', '.compare-list',
    '.promise-grid > *', '.path-grid > *', '.team-grid > *', '.faq-list', '.waitlist'
  ];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-visible');
        revealIO.unobserve(el);
        // Once shown, drop the reveal styles so hover transitions behave normally.
        setTimeout(function () { el.removeAttribute('data-reveal'); el.style.removeProperty('--i'); }, 1200);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    REVEAL_GROUPS.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (el.offsetParent === null) return; // hidden at this breakpoint
        var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.matches(selector); });
        el.style.setProperty('--i', Math.min(siblings.indexOf(el), 5));
        el.setAttribute('data-reveal', '');
        revealIO.observe(el);
      });
    });
    // Footer logo spins once when it comes into view.
    var footerBrand = document.querySelector('.site-footer .brand');
    if (footerBrand) revealIO.observe(footerBrand);
  } else {
    // No animation: make sure ring/curve end states are shown.
    document.querySelectorAll('.how-visual, .curve-card').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------- Waitlist form ---------------- */
  var form = document.getElementById('waitlist-form');
  if (!form) return;

  var email = form.querySelector('#wl-email');
  var consent = form.querySelector('#wl-consent');
  var honeypot = form.querySelector('#wl-company');
  var emailErr = form.querySelector('#wl-email-error');
  var consentErr = form.querySelector('#wl-consent-error');
  var status = form.querySelector('#wl-status');
  var submit = form.querySelector('.form-submit');
  var submitLabel = submit.querySelector('.btn-label');
  var success = document.getElementById('wl-success');

  var MSG = {
    emailMissing: 'Please enter your email address.',
    emailInvalid: 'Please enter a valid email address, like name@example.com.',
    consentMissing: 'Please tick the box to agree, so we can email you.',
    sending: 'Joining…',
    failed: 'Sorry, something went wrong and you were not added. Please try again in a moment.'
  };

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, el, msg) {
    if (msg) {
      el.textContent = msg; el.hidden = false;
      input.setAttribute('aria-invalid', 'true');
    } else {
      el.textContent = ''; el.hidden = true;
      input.removeAttribute('aria-invalid');
    }
  }

  function validate() {
    var v = email.value.trim();
    var emailMsg = !v ? MSG.emailMissing : (!EMAIL_RE.test(v) ? MSG.emailInvalid : '');
    var consentMsg = consent.checked ? '' : MSG.consentMissing;
    setError(email, emailErr, emailMsg);
    setError(consent, consentErr, consentMsg);
    if (emailMsg) { email.focus(); return false; }
    if (consentMsg) { consent.focus(); return false; }
    return true;
  }

  // Clear an error as soon as it is fixed.
  email.addEventListener('input', function () {
    if (email.getAttribute('aria-invalid') && EMAIL_RE.test(email.value.trim())) setError(email, emailErr, '');
  });
  consent.addEventListener('change', function () {
    if (consent.checked) setError(consent, consentErr, '');
  });

  /**
   * Provider adapter: the only function that knows about the backend.
   * Swap this out to move to another provider (e.g. an EU service with double opt-in).
   * Resolves on success, rejects on failure.
   */
  function submitToProvider(data) {
    if (!CONFIG.WAITLIST_ENDPOINT) {
      // Demo mode: nothing is sent or stored.
      console.info('[FertiClock] Waitlist endpoint not configured; demo submit:', data);
      return new Promise(function (resolve) { setTimeout(resolve, 600); });
    }
    // text/plain keeps this a "simple" CORS request, which Apps Script accepts.
    return fetch(CONFIG.WAITLIST_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
      redirect: 'follow'
    })
      .then(function (res) { return res.json(); })
      .then(function (json) { if (!json || json.ok !== true) throw new Error((json && json.error) || 'Rejected'); });
  }

  function showSuccess() {
    form.hidden = true;
    success.hidden = false;
    success.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    if (!validate()) return;

    // Bots fill the hidden field: pretend it worked and store nothing.
    if (honeypot.value) { showSuccess(); return; }

    var data = {
      email: email.value.trim(),
      consent: true,
      consent_version: CONFIG.CONSENT_VERSION,
      language: document.documentElement.lang || 'en',
      source: location.pathname
    };

    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    submitLabel.textContent = MSG.sending;

    submitToProvider(data)
      .then(showSuccess)
      .catch(function (err) {
        console.error('[FertiClock] Waitlist submit failed:', err);
        status.textContent = MSG.failed;
      })
      .then(function () {
        submit.disabled = false;
        submit.removeAttribute('aria-busy');
        submitLabel.textContent = 'Join the waitlist';
      });
  });
})();
