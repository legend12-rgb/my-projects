/* ===========================================================================
   DOUBLESHOT - shared behaviour for the inner pages.
   Classic script (not a module) so the inner pages need no import map.
   The homepage's Three.js film engine is separate and self-contained.

   Page changes are full navigations animated by cross-document View
   Transitions (see site.css). swup was removed: it cannot swap into or out of
   the homepage (its film is an ES module), so half the site never animated.
   =========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var coarse = window.matchMedia('(pointer:coarse)').matches;
  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  /* ---- Lenis inertial scroll, with GSAP ScrollTrigger reading the same scroll */
  var lenis = null;
  // 2026-09-12 mobile pass: Lenis only for fine pointers. On touch it does not smooth
  // anything (native touch scroll) but still overrode native programmatic scrolls
  // (scrollBy 500 -> moved 4px in the phone test): status-bar tap to top, anchors.
  // darkroom's own playbook: gate the scroll library to desktop.
  var finePointer = window.matchMedia('(pointer:fine)').matches;
  if (!reduce && finePointer && typeof Lenis !== 'undefined') {
    // 2026-09-12 (client: "glitching a lot"): lerp instead of duration (continuous
    // interpolation; duration restarts an eased tween on every wheel notch), and Lenis
    // is driven by GSAP's ticker (Lenis README) so the scroll, ScrollTrigger and every
    // scrub update in the same frame. Its own rAF loop ran out of step with GSAP.
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    if (!hasGsap) requestAnimationFrame(function raf(t) { lenis.raf(t); requestAnimationFrame(raf); });
  }
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    // phones: the address bar showing/hiding is a height-only resize; re-measuring every
    // trigger on it makes pinned sections jump mid-scroll (GSAP's own starter sets this)
    ScrollTrigger.config({ ignoreMobileResize: true });
    // Pins stay position:fixed (the default). 2026-09-11 tried pinType 'transform' to
    // lower lab CLS; it made pinned sections shake against the scroll (official GSAP
    // skill: use 'fixed' if pins jitter). Smoothness wins over a lab number.
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }
  window.__dsLenis = lenis;

  /* ---- nav: deepens on scroll, hides going down, returns going up --------- */
  var nav = document.getElementById('nav');
  if (nav) {
    var last = window.scrollY;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      // phones (2026-09-13): the bar turns solid as soon as the page moves; with the
      // desktop threshold (60% of a screen) the hero text scrolled through the
      // see-through bar and collided with the wordmark and the order box
      nav.classList.toggle('deep', y > (window.innerWidth <= 820 ? 24 : window.innerHeight * 0.6));
      if (y > last && y > window.innerHeight) nav.classList.add('hide');
      else nav.classList.remove('hide');
      last = y;
    }, { passive: true });
  }

  function markCurrent() {
    var here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#nav nav a[href]').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('#')[0];
      if (href === here) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  /* ---- hero: title characters rise just after the wipe has landed --------- */
  function bindHero() {
    var hx = document.querySelector('.hx');
    if (!hx) return;
    // 420ms lets the incoming page's clip-path wipe mostly finish first
    // (Codrops choreography: headings follow the page at ~+0.45s).
    setTimeout(function () { hx.classList.add('in'); }, reduce ? 0 : 420);
  }

  /* ---- heading reveals: characters rise out of a mask, not a fade -------- */
  function bindSplit() {
    if (typeof SplitType === 'undefined' || reduce) return;
    document.querySelectorAll('.hx-title, h2.sec, .big, .mcat-h, .giant, .a3-word, .bn').forEach(function (el) {
      if (el.dataset.split) return;
      el.dataset.split = '1';
      new SplitType(el, { types: 'words,chars' });
      var step = el.classList.contains('giant') ? 0.035 : el.classList.contains('hx-title') ? 0.03 : 0.018;
      el.querySelectorAll('.char').forEach(function (c, i) {
        c.style.transitionDelay = (i * step) + 's';
      });
      if (el.classList.contains('hx-title')) return;   // driven by bindHero
      new IntersectionObserver(function (es, o) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); }
        });
      }, { threshold: 0.3 }).observe(el);
    });
  }

  /* ---- generic reveal on scroll ------------------------------------------- */
  function bindReveals() {
    var els = document.querySelectorAll('[data-reveal]:not(.in)');
    if (!els.length) return;
    if (reduce) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var delay = parseFloat(e.target.dataset.reveal) || 0;
        setTimeout(function () { e.target.classList.add('in'); }, delay * 1000);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- parallax: data-parallax depth, optional data-scale ------------------ */
  function bindParallax() {
    if (reduce) return;
    var items = [].slice.call(document.querySelectorAll('[data-parallax]')).map(function (el) {
      return { el: el, depth: parseFloat(el.dataset.parallax) || 0.12,
               scale: el.dataset.scale ? parseFloat(el.dataset.scale) : 1.16 };
    });
    if (!items.length) return;
    // all reads first, then all writes (official GSAP performance skill: no interleaved
    // read/write thrash), on GSAP's ticker so it lands in the same frame as the scroll
    function tick() {
      var vh = window.innerHeight;
      var rs = items.map(function (p) { return p.el.getBoundingClientRect(); });
      for (var i = 0; i < items.length; i++) {
        var p = items[i], r = rs[i];
        if (r.bottom < -vh || r.top > vh * 2) continue;
        var off = ((r.top + r.height / 2) - vh / 2) / vh;
        p.el.style.transform =
          'translate3d(0,' + (off * p.depth * 100).toFixed(2) + 'px,0) scale(' + p.scale + ')';
      }
    }
    if (hasGsap) gsap.ticker.add(tick);
    else (function loop() { tick(); requestAnimationFrame(loop); })();
  }

  /* ---- marquee: speed and direction follow the scroll --------------------- */
  function bindMarquee() {
    var track = document.querySelector('.mq-track');
    if (!track || reduce || !track.animate) return;
    var anim = track.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
                             { duration: 42000, iterations: Infinity });
    if (lenis) lenis.on('scroll', function (l) {
      var v = l.velocity || 0;
      anim.playbackRate = (v < -0.5 ? -1 : 1) * (1 + Math.min(Math.abs(v), 40) * 0.09);
    });
  }

  /* ---- closing wordmark fitted exactly to the footer width ---------------- */
  function bindGiant() {
    var g = document.querySelector('.giant');
    if (!g) return;
    function fit() {
      g.style.fontSize = '17vw';
      var r = g.clientWidth / g.scrollWidth;
      if (r < 1 || r > 1.02) g.style.fontSize = (parseFloat(getComputedStyle(g).fontSize) * r * 0.97) + 'px';
    }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
    window.addEventListener('resize', fit);
  }

  /* ---- menu rows: cut-out trails the pointer, other rows dim --------------
     Only rows with a real photo of that exact drink carry data-img. The old
     version showed film frames that matched none of the items.              */
  function bindHoverImage() {
    if (coarse || reduce) return;
    var rows = document.querySelectorAll('.menu li[data-img]');
    if (!rows.length) return;
    var box = document.createElement('div');
    box.id = 'hoverimg';
    document.body.appendChild(box);
    // The img is created on the first hover: an <img> with no src is reported
    // as a broken image by audits and assistive tech.
    var img = null, hx = 0, hy = 0, tx = 0, ty = 0, raf = null;
    function loop() {
      hx += (tx - hx) * 0.14; hy += (ty - hy) * 0.14;
      box.style.left = hx + 'px'; box.style.top = hy + 'px';
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener('pointermove', function (e) { tx = e.clientX + 170; ty = e.clientY; });
    rows.forEach(function (li) {
      li.addEventListener('pointerenter', function () {
        if (!img) { img = new Image(); img.alt = ''; box.appendChild(img); }
        img.src = li.dataset.img;
        box.classList.add('on'); li.classList.add('hot');
        li.closest('.menu').classList.add('dimmed');
        if (!raf) { hx = tx; hy = ty; loop(); }
      });
      li.addEventListener('pointerleave', function () {
        box.classList.remove('on'); li.classList.remove('hot');
        li.closest('.menu').classList.remove('dimmed');
        if (raf) { cancelAnimationFrame(raf); raf = null; }
      });
    });
  }

  /* ---- menu page: sticky category rail, row cascade, featured drift -------- */
  function bindMenu() {
    var rail = document.querySelector('.mrail');
    if (!rail) return;
    var links = [].slice.call(rail.querySelectorAll('a[href^="#"]'));
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var t = document.querySelector(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(t, { offset: -110, duration: 1.4 });
        else t.scrollIntoView({ behavior: 'smooth' });
      });
    });
    if (!hasGsap) { if (links[0]) links[0].classList.add('on'); return; }

    document.querySelectorAll('.mcat').forEach(function (sec) {
      ScrollTrigger.create({
        trigger: sec, start: 'top 55%', end: 'bottom 55%',
        onToggle: function (self) {
          if (!self.isActive) return;
          links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + sec.id); });
        }
      });
    });
    if (links[0]) links[0].classList.add('on');

    if (!reduce) {
      gsap.set('.mcat .menu li', { opacity: 0, y: 26 });
      ScrollTrigger.batch('.mcat .menu li', {
        start: 'top 92%',
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, stagger: 0.045, duration: 0.9, ease: 'expo.out', overwrite: true });
        }
      });
      gsap.utils.toArray('.feat').forEach(function (f, i) {
        gsap.fromTo(f, { y: 70 + (i % 2) * 50 }, {
          y: -40 - (i % 2) * 30, ease: 'none',
          scrollTrigger: { trigger: '.featured', start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
    }
  }

  /* ---- roastery: pinned horizontal three-act scroll + stacking brew bands --
     2026-09-13: phones get the horizontal pin too (client: everything the laptop
     shows must be on the phone). It is still driven by the normal vertical scroll,
     never a sideways swipe. .h arms the horizontal layout; without it (no GSAP,
     reduced motion) phones keep the vertical stack (CSS).                   */
  function bindRoastery() {
    var a3 = document.querySelector('.acts3');
    if (a3) {
      var labels = [].slice.call(a3.querySelectorAll('.a3-prog span'));
      if (labels[0]) labels[0].classList.add('on');
      if (hasGsap && !reduce) {
        a3.classList.add('h');
        var track = a3.querySelector('.acts3-track');
        var panels = a3.querySelectorAll('.a3');
        var bar = a3.querySelector('.a3-bar i');
        var dist = function () { return track.scrollWidth - window.innerWidth; };
        var tween = gsap.to(track, {
          x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: {
            trigger: a3, start: 'top top', end: function () { return '+=' + dist(); },
            pin: a3.querySelector('.acts3-pin'), scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: function (self) {
              var i = Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1)));
              labels.forEach(function (l, k) { l.classList.toggle('on', k === i); });
              if (bar) bar.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')';
            }
          }
        });
        // each photo drifts inside its frame as its panel slides past
        panels.forEach(function (p) {
          var img = p.querySelector('figure img');
          if (!img) return;
          gsap.fromTo(img, { xPercent: -7 }, {
            xPercent: 7, ease: 'none',
            scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
          });
        });
      }
    }
    // stacking bands: a band settles back slightly as the next one covers it
    var bands = [].slice.call(document.querySelectorAll('.band'));
    if (bands.length && hasGsap && !reduce) {
      bands.forEach(function (b, i) {
        var next = bands[i + 1];
        if (!next) return;
        gsap.to(b, {
          scale: 0.94, ease: 'none', transformOrigin: '50% 0%',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true }
        });
      });
      // 2026-09-11: each band's photo opens from a thin slit as the band rises,
      // then eases down in scale and drifts. The figure carries the clip (not the
      // img), so nothing observes a clipped target.
      bands.forEach(function (b) {
        var fig = b.querySelector('.band-ph');
        if (!fig) return;
        gsap.timeline({ scrollTrigger: { trigger: b, start: 'top 95%', end: 'top 30%', scrub: 0.6 } })
          .fromTo(fig, { clipPath: 'inset(46% 0% 46% 0%)' },
                       { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out', duration: 0.6 }, 0)
          .fromTo(fig.querySelector('img'), { scale: 1.3, yPercent: 6 },
                                            { scale: 1.1, yPercent: -3, ease: 'none', duration: 1 }, 0);
      });
    }
  }

  /* ---- menu: the signature moment ------------------------------------------
     One pinned authored moment: each signature fills upward behind a liquid
     line (a wave mask, CSS), its name rises out of a mask, the rail names the
     step. body.has-sig swaps the plain featured row for it, so reduced motion
     and a failed CDN keep the static row. 2026-09-13: phones get it too (its own
     phone layout in build_pages MENU_EXTRA).                                  */
  function bindSig() {
    var sig = document.querySelector('.sig');
    if (!sig || !hasGsap || reduce) return;
    document.body.classList.add('has-sig');
    var groups = ['.sig-name', '.sig-cup', '.sig-meta-i', '.sig-rail li'].map(function (s) {
      return [].slice.call(sig.querySelectorAll(s));
    });
    var n = groups[1].length, cur = -1;
    function show(i) {
      if (i === cur) return;
      cur = i;
      groups.forEach(function (g) {
        g.forEach(function (el, k) { el.classList.toggle('on', k === i); el.classList.toggle('past', k < i); });
      });
    }
    show(0);
    ScrollTrigger.create({
      trigger: sig, start: 'top top', end: function () { return '+=' + Math.round(window.innerHeight * 0.6 * n); },
      pin: sig.querySelector('.sig-pin'), anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: function (self) { show(Math.min(n - 1, Math.floor(self.progress * n))); }
    });
  }

  /* ---- locations: routes drawn out of the roaster, city rows open ----------
     Desktop: the map is sticky; each city's route draws as its row arrives and
     the row's photo opens (clip-path, CSS). Phones: the map sits on top and all
     routes draw once. .lmap.js gates every hidden state, so no JS = all visible. */
  function bindLocations() {
    var lm = document.querySelector('.lmap');
    if (!lm || !hasGsap || reduce) return;
    lm.classList.add('js');
    var wide = window.innerWidth > 820;
    var cities = [].slice.call(lm.querySelectorAll('.city'));
    function light(id) {
      lm.querySelectorAll('.map [data-city]').forEach(function (el) { el.classList.toggle('on', el.dataset.city === id); });
      cities.forEach(function (c) { c.classList.toggle('on', c.dataset.city === id); });
    }
    cities.forEach(function (c) {
      var id = c.dataset.city;
      // onEnter fires even on a fast fling, so a skipped row still opens
      ScrollTrigger.create({ trigger: c, start: 'top 75%', once: true, onEnter: function () { c.classList.add('seen'); } });
      ScrollTrigger.create({ trigger: c, start: 'top 60%', end: 'bottom 45%',
        onToggle: function (self) { if (self.isActive) light(id); } });
      var route = lm.querySelector('.map .route[data-city="' + id + '"]');
      if (route && wide) gsap.fromTo(route, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: c, start: 'top 95%', end: 'top 55%', scrub: 0.5 } });
    });
    if (!wide) gsap.to(lm.querySelectorAll('.map .route'), { strokeDashoffset: 0, duration: 1.6, stagger: 0.25,
      ease: 'power2.inOut', scrollTrigger: { trigger: lm.querySelector('.map'), start: 'top 75%', once: true } });
  }

  /* ---- bakery: the counter + the crumb window opening to full screen -------
     Each item flips in with a spin, turns as the page scrolls past it, and tilts
     toward the cursor; the round bakes (.ci-roll) roll in and keep rolling.
     One layer per job, so no two tweens fight over the same transform:
       .ci       reveal opacity + depth parallax (y)
       .ci-in    scroll-scrubbed turn (rotation + rotationY swing)
       .ci-spin  entrance (x, rotation, rotationY, scale)
       img       cursor tilt + hover lift                                     */
  function bindBakery() {
    if (!hasGsap || reduce) return;
    var cis = gsap.utils.toArray('.ci');
    if (cis.length) {
      gsap.set(cis, { opacity: 0 });
      cis.forEach(function (ci, i) {
        var dir = i % 2 ? 1 : -1;
        gsap.set(ci.querySelector('.ci-spin'), ci.classList.contains('ci-roll')
          ? { x: -dir * 280, rotation: -dir * 320 }
          : { rotation: dir * 28, rotationY: -dir * 70, scale: 0.72, transformPerspective: 900 });
      });
      ScrollTrigger.batch(cis, {
        start: 'top 88%',
        onEnter: function (b) {
          gsap.to(b, { opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power2.out', overwrite: 'auto' });
          gsap.to(b.map(function (c) { return c.querySelector('.ci-spin'); }),
            { x: 0, rotation: 0, rotationY: 0, scale: 1, duration: 1.6, stagger: 0.1, ease: 'expo.out' });
        }
      });
      cis.forEach(function (ci, i) {
        var s = parseFloat(ci.dataset.speed) || 0.8;
        var dir = i % 2 ? 1 : -1;
        var roll = ci.classList.contains('ci-roll');
        // each item drifts at its own speed, so the counter reads as depth, not a grid
        gsap.fromTo(ci, { y: 60 * s }, {
          y: -60 * s, ease: 'none',
          scrollTrigger: { trigger: '.cgrid', start: 'top bottom', end: 'bottom top', scrub: true }
        });
        // the turn: a slow swing for most, a real roll for the bagels
        var inner = ci.querySelector('.ci-in');
        gsap.set(inner, { transformPerspective: 900 });
        gsap.fromTo(inner,
          { rotation: roll ? -dir * 90 : -dir * 9, rotationY: dir * 16 },
          { rotation: roll ? dir * 90 : dir * 9, rotationY: -dir * 16, ease: 'none',
            scrollTrigger: { trigger: ci, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      });
      if (!coarse) cis.forEach(function (ci) {
        var img = ci.querySelector('img');
        gsap.set(img, { transformPerspective: 700 });
        var rx = gsap.quickTo(img, 'rotationX', { duration: 0.6, ease: 'power3.out' });
        var ry = gsap.quickTo(img, 'rotationY', { duration: 0.6, ease: 'power3.out' });
        ci.addEventListener('pointermove', function (e) {
          var r = ci.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 26);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 20);
        });
        ci.addEventListener('pointerenter', function () { gsap.to(img, { y: -14, scale: 1.05, duration: 0.6, ease: 'power3.out', overwrite: 'auto' }); });
        ci.addEventListener('pointerleave', function () {
          rx(0); ry(0);
          gsap.to(img, { y: 0, scale: 1, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
        });
      });
    }
    var macro = document.querySelector('.macro');
    if (macro) {
      // 2026-09-11: the crumb assembles out of squares. A grid of ink tiles (near-square:
      // rows follow the viewport's aspect) covers the photo; they shrink away in random
      // order as the pin scrubs. Replaces the clip-path window.
      var tiles = macro.querySelector('.macro-tiles'), cells = [];
      if (tiles) {
        var cols = window.innerWidth > 820 ? 14 : 7;
        var rows = Math.max(3, Math.round(cols * window.innerHeight / window.innerWidth));
        tiles.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
        tiles.style.gridTemplateRows = 'repeat(' + rows + ',1fr)';
        for (var t = 0; t < cols * rows; t++) cells.push(tiles.appendChild(document.createElement('i')));
      }
      gsap.set('.macro-copy', { opacity: 0 });
      // the squares start clearing while the section is still sliding in (85% down the
      // screen), not at the pin: on phones the pin opened on a screen fully covered by
      // ink tiles, which read as an empty, stuck page
      if (cells.length) gsap.to(gsap.utils.shuffle(cells.slice()), {
        scale: 0, opacity: 0, ease: 'power2.in', stagger: { each: 1 / cells.length },
        scrollTrigger: { trigger: macro, start: 'top 85%', end: 'top -55%', scrub: 1 }
      });
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: macro, start: 'top top', end: '+=150%', pin: macro.querySelector('.macro-pin'), scrub: 1, anticipatePin: 1 }
      })
        .to('.macro-img img', { scale: 1, duration: 1 }, 0)
        .to('.macro-copy', { opacity: 1, duration: 0.35 }, 0.55)
        .fromTo('.macro-copy', { y: 40 }, { y: 0, duration: 0.45, ease: 'power2.out' }, 0.55);
    }
  }

  bindHero();
  bindSplit();
  bindRoastery();
  bindBakery();
  bindReveals();
  bindParallax();
  bindMarquee();
  bindGiant();
  bindHoverImage();
  bindSig();          // before bindMenu: ScrollTriggers are created in page order
  bindMenu();
  bindLocations();
  markCurrent();
  if (hasGsap) window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
