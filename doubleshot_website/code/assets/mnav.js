/* ===========================================================================
   DOUBLESHOT phone navigation (2026-09-13).
   Client: on a phone "the upper buttons are not visible, I cannot switch between
   tabs". Below 820px the page links do not fit beside the wordmark and the order
   box, so a two-line button opens every page as a full-screen list. Desktop never
   shows the button (CSS), so nothing changes there.
   Also keeps --navh (the header's height) and html.nav-hidden in sync, so sticky
   bars (the Menu category rail) sit under the header while it shows and take the
   top of the screen once it hides.
   =========================================================================== */
(function () {
  'use strict';
  var root = document.documentElement;
  var nav = document.getElementById('nav');
  if (!nav) return;

  function sync() {
    root.style.setProperty('--navh', nav.offsetHeight + 'px');
    root.classList.toggle('nav-hidden', nav.classList.contains('hide'));
  }
  sync();
  new MutationObserver(sync).observe(nav, { attributes: true, attributeFilter: ['class'] });
  if (window.ResizeObserver) new ResizeObserver(sync).observe(nav);

  var btn = nav.querySelector('.mnav-btn');
  var panel = document.getElementById('mnav');
  if (!btn || !panel) return;
  root.classList.add('has-mnav');   // the button only shows once this script runs

  var here = location.pathname.split('/').pop() || 'index.html';
  [].slice.call(panel.querySelectorAll('a[href]')).forEach(function (a) {
    if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
  });

  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var timer = null;
  function isOpen() { return root.classList.contains('mnav-open'); }
  // everything except the header and the panel is inert while the panel is open
  function setInert(on) {
    [].slice.call(document.body.children).forEach(function (el) {
      if (el === nav || el === panel || el.tagName === 'SCRIPT') return;
      if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }
  function open() {
    clearTimeout(timer);
    var order = nav.querySelector('details.order[open]');
    if (order) order.open = false;
    panel.hidden = false;
    nav.classList.remove('hide');
    root.classList.add('mnav-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close pages');
    setInert(true);
    if (window.__dsLenis) window.__dsLenis.stop();
    // force a layout so the wipe starts from the closed clip-path; synchronous, so it
    // does not depend on animation frames (a delayed double rAF in WebKit could add
    // .open after the panel had already been closed again)
    void panel.offsetWidth;
    panel.classList.add('open');
  }
  function close(focusBtn) {
    if (!isOpen()) return;
    panel.classList.remove('open');
    root.classList.remove('mnav-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open pages');
    setInert(false);
    if (window.__dsLenis) window.__dsLenis.start();
    timer = setTimeout(function () { panel.hidden = true; }, reduce ? 0 : 650);
    if (focusBtn) btn.focus();
  }

  btn.addEventListener('click', function () { if (isOpen()) close(); else open(); });
  // the page you are already on: just close (and go back to its top), no reload
  [].slice.call(panel.querySelectorAll('a[aria-current]')).forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      close();
      window.scrollTo(0, 0);
    });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) close(true); });
  [].slice.call(nav.querySelectorAll('details.order')).forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) close(); });
  });
  // back/forward cache: never come back to a page with the panel still open
  window.addEventListener('pageshow', function () { close(); panel.hidden = true; });
  window.addEventListener('resize', function () { if (window.innerWidth > 820) close(); });
})();
