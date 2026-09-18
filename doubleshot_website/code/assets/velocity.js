/* ===========================================================================
   DOUBLESHOT: photos bend with scroll speed. GreenSock's "skew on scroll
   velocity" pattern, rebuilt without ScrollTrigger so one small file runs on
   every page. Scroll fast and the photo frames lean, a touch like liquid in a
   moving cup; they settle upright the moment the page is still.
   - Only frames whose transform nothing else owns (no GSAP, no data-reveal).
   - Only frames on screen are written, and nothing is written while idle.
   - Fine pointers only (Lenis smooths wheel scroll; native touch scroll would
     read as jitter). Reduced motion gets nothing.
   =========================================================================== */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches ||
      !window.matchMedia('(pointer:fine)').matches) return;
  var SEL = '.act figure, .rs-frame, .loc-photo, .city-ph, .band-ph, .ig-tile';
  var els = [].slice.call(document.querySelectorAll(SEL));
  if (!els.length) return;

  var vis = new Set();
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) vis.add(e.target);
      else { vis.delete(e.target); e.target.style.transform = ''; }
    });
  }, { rootMargin: '10% 0px' });
  els.forEach(function (el) { io.observe(el); });

  var last = window.scrollY, s = 0, shown = 0;
  (function tick() {
    var y = window.scrollY, v = y - last;
    last = y;
    // 2026-09-12: gentler (client felt the scroll "glitching"): slower response, half
    // the lean (cap 2deg), no stretch. A lean, not a wobble.
    s += (v - s) * 0.07;                                  // smoothed px per frame
    var k = Math.max(-2, Math.min(2, -s * 0.05));        // degrees, capped
    if (Math.abs(k) < 0.03) k = 0;
    if (k !== shown) {
      shown = k;
      var t = k ? 'skewY(' + k.toFixed(3) + 'deg)' : '';
      vis.forEach(function (el) { el.style.transform = t; });
    }
    requestAnimationFrame(tick);
  })();
})();
