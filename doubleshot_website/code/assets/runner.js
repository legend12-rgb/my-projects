/* ===========================================================================
   DOUBLESHOT runner: the heart of the site (client pick, 2026-09-12).
   The line-art runner painted on the client's own cafe wall ("Amritsar runs on
   Doubleshot", IG DPOBDYnCc6g), traced into five rig parts (window.DS_RUNNER,
   assets/runner-paths.js): back leg, back arm, body, front leg, front arm.

   - [data-runner="hero"]: big, draws itself (outline, then the fill lands) when
     it comes into view, then jogs whenever the page scrolls.
   - The track (every page, built here): a small runner on a hairline at the
     bottom of the screen. His position is your progress down the page, his
     stride is your scroll: he only runs while you scroll, turns round when you
     scroll back up, and arrives at the steaming cup at the end of the page.
     On the homepage the track waits until the film is over (#runs).
   The limbs swing on hip and shoulder pivots, so it is a stride, not a slide.
   Reduced motion: the finished drawing, positioned, no stride.
   =========================================================================== */
(function () {
  'use strict';
  var R = window.DS_RUNNER;
  if (!R) return;
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  function build(el, drawn) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + R.w + ' ' + R.h);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var body = document.createElementNS(NS, 'g');     // bob wrapper
    body.setAttribute('class', 'rp-all');
    var g = {};
    R.order.forEach(function (name) {
      var grp = document.createElementNS(NS, 'g');
      grp.setAttribute('class', 'rp rp-' + name);
      var pv = R.pivot[name];
      if (pv) grp.style.transformOrigin = pv[0] + 'px ' + pv[1] + 'px';
      // ONE path per part: the traced line art is outline rings (outer + inner
      // contour), and evenodd only punches the hole when both are in the same path.
      // As separate paths every ring filled solid and he became a white silhouette.
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', R.parts[name].join(' '));
      p.setAttribute('pathLength', '1');
      grp.appendChild(p);
      body.appendChild(grp);
      g[name] = grp;
    });
    svg.appendChild(body);
    el.appendChild(svg);
    el.classList.add('runner');
    if (drawn || reduce) el.classList.add('drawn');
    return { el: el, body: body, g: g, phase: 0, amp: 0 };
  }

  // stride: legs swing opposite each other around the hips, arms against the legs,
  // the body bobs twice per cycle. amp 0 = exactly the mural's pose.
  function pose(r) {
    var s = Math.sin(r.phase), a = r.amp;
    r.g.legB.style.transform = 'rotate(' + (s * 13 * a).toFixed(2) + 'deg)';
    r.g.legF.style.transform = 'rotate(' + (-s * 13 * a).toFixed(2) + 'deg)';
    r.g.armB.style.transform = 'rotate(' + (-s * 16 * a).toFixed(2) + 'deg)';
    r.g.armF.style.transform = 'rotate(' + (s * 16 * a).toFixed(2) + 'deg)';
    r.body.style.transform = 'translateY(' + (-Math.abs(Math.cos(r.phase)) * 5 * a).toFixed(2) + 'px)';
  }

  // ---- the big one beside "Amritsar runs on Doubleshot" ----------------------
  var heroes = [].slice.call(document.querySelectorAll('[data-runner="hero"]')).map(function (el) {
    var r = build(el, false);
    r.visible = false;
    // visible = any part on screen (keeps the stride easing back to rest as he
    // leaves; with the 0.35 threshold alone he froze mid-stride); draw at 35%
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        r.visible = e.isIntersecting;
        if (e.intersectionRatio >= 0.35 && !r.started) {
          r.started = true;
          if (!reduce) {
            el.classList.add('drawing');
            requestAnimationFrame(function () { el.classList.add('drawn'); });
          }
        }
      });
    }, { threshold: [0, 0.35] }).observe(el);
    return r;
  });

  // ---- the track --------------------------------------------------------------
  var track = document.createElement('div');
  track.id = 'run-track';
  track.setAttribute('aria-hidden', 'true');
  track.innerHTML = '<div class="rt-line"><i></i></div><div class="rt-runner"><div class="rt-flip"></div></div>' +
                    '<span class="rt-cup" data-ds-mark="load"></span>';
  document.body.appendChild(track);
  var mini = build(track.querySelector('.rt-flip'), true);
  var fill = track.querySelector('.rt-line i');
  var runEl = track.querySelector('.rt-runner');
  var flip = track.querySelector('.rt-flip');
  var cup = track.querySelector('.rt-cup');
  if (window.DSMark) window.DSMark.mount(cup, { mode: 'load', delay: 0 });
  var runsSec = document.getElementById('runs');   // homepage: wait for the film to end

  var lastY = window.scrollY, vs = 0, facing = 1, shown = false;
  function frame() {
    var y = window.scrollY, dy = y - lastY;
    lastY = y;
    vs += (dy - vs) * 0.25;
    var moving = Math.abs(vs) > 0.4;

    // where the journey starts: after the film on the homepage, near the top elsewhere
    var start = 0;
    if (runsSec) start = Math.max(0, runsSec.getBoundingClientRect().top + y - window.innerHeight * 0.4);
    var end = document.documentElement.scrollHeight - window.innerHeight - 2;
    var p = end > start ? Math.max(0, Math.min(1, (y - start) / (end - start))) : 0;
    var show = runsSec ? y > start : y > window.innerHeight * 0.1;
    if (show !== shown) { shown = show; track.classList.toggle('on', show); }

    if (shown) {
      var tw = track.clientWidth, rw = runEl.offsetWidth, cw = cup.offsetWidth;
      var x = p * Math.max(0, tw - rw - cw - 6);
      runEl.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      fill.style.transform = 'scaleX(' + (tw ? ((x + rw * 0.5) / (tw - cw)).toFixed(4) : 0) + ')';
      track.classList.toggle('arrived', p > 0.985);
      if (moving && Math.sign(dy) && Math.sign(dy) !== facing) {
        facing = Math.sign(dy);
        flip.style.transform = facing < 0 ? 'scaleX(-1)' : '';
      }
    }
    if (reduce) return;
    // stride: phase advances with scroll distance, amplitude follows speed
    var target = Math.min(1, Math.abs(vs) / 5);
    var step = function (r) {
      r.amp += (target - r.amp) * (target > r.amp ? 0.3 : 0.08);
      if (r.amp < 0.004) r.amp = 0;
      r.phase += Math.min(Math.abs(dy), 60) * 0.05;
      pose(r);
    };
    if (shown) step(mini);
    for (var i = 0; i < heroes.length; i++) {
      var h = heroes[i];
      if (h.started && (h.visible || h.amp > 0)) step(h);   // off screen: finish settling, then stop
    }
  }
  if (typeof gsap !== 'undefined') gsap.ticker.add(frame);
  else (function loop() { frame(); requestAnimationFrame(loop); })();
})();
