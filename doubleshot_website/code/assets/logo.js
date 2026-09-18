/* ===========================================================================
   DOUBLESHOT living logo. The cup-and-steam mark, traced from the client's own
   shopfront sign (window.DS_MARK, assets/logo-paths.js).

   The outline draws itself (stroke-dashoffset on pathLength=1), then the fill
   arrives. The steam above the cup rim is its own group: a turbulence
   displacement keeps it curling, and it leans toward the cursor. It only
   animates while on screen, and reduced motion gets the finished mark.

   Markup:  <span class="ds-mark" data-ds-mark="load|view|progress" data-part="steam"></span>
            data-part="steam" draws only the steam (section dividers).
   Script:  var m = DSMark.mount(el, { mode: 'progress' }); m.progress(0.4); m.draw();
   =========================================================================== */
(function () {
  'use strict';
  var M = window.DS_MARK;
  if (!M) return;
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine = window.matchMedia('(pointer:fine)').matches;
  var uid = 0, live = [], px = -1, py = -1, raf = null;

  function build(el, part) {
    var id = 'dsm' + (++uid), W = M.w, H = M.h, R = M.rim;
    var paths = M.d.map(function (d) { return '<path d="' + d + '" pathLength="1"/>'; }).join('');
    var steamOnly = part === 'steam';
    var top = steamOnly ? 0 : -40, vbH = steamOnly ? R : H;
    el.innerHTML =
      '<svg viewBox="0 ' + top + ' ' + W + ' ' + (vbH - top) + '" aria-hidden="true" focusable="false">' +
      '<defs>' +
      '<clipPath id="' + id + 's"><rect x="-60" y="-60" width="' + (W + 120) + '" height="' + (R + 60) + '"/></clipPath>' +
      '<clipPath id="' + id + 'c"><rect x="-60" y="' + R + '" width="' + (W + 120) + '" height="' + (H - R + 60) + '"/></clipPath>' +
      '<filter id="' + id + 'f" x="-40%" y="-40%" width="180%" height="180%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.010 0.028" numOctaves="2" seed="7"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter></defs>' +
      // loader only: a faint full mark for the drawing to trace over, so 0% is never blank
      (part === 'ghost' ? '<g class="dsm-ghost">' + paths + '</g>' : '') +
      (steamOnly ? '' : '<g class="dsm-cup" clip-path="url(#' + id + 'c)">' + paths + '</g>') +
      '<g clip-path="url(#' + id + 's)"><g class="dsm-steam" filter="url(#' + id + 'f)">' + paths + '</g></g>' +
      '</svg>';
    var svg = el.firstChild;
    return {
      el: el, svg: svg,
      paths: [].slice.call(svg.querySelectorAll('path')),
      steam: svg.querySelector('.dsm-steam'),
      turb: svg.querySelector('feTurbulence'),
      disp: svg.querySelector('feDisplacementMap'),
      originX: W / 2, originY: R, lean: 0, visible: false, phase: Math.random() * 10
    };
  }

  function setOffset(m, v) {
    for (var i = 0; i < m.paths.length; i++) m.paths[i].style.strokeDashoffset = v;
  }

  function loop(t) {
    raf = null;
    var any = false;
    for (var i = 0; i < live.length; i++) {
      var m = live[i];
      if (!m.visible || !m.drawn) continue;
      any = true;
      var s = t / 1000 + m.phase;
      // slow curl: the noise field drifts, displacement breathes 5..11
      m.turb.setAttribute('baseFrequency', (0.010 + Math.sin(s * 0.35) * 0.002).toFixed(4) + ' ' +
                                           (0.028 + Math.cos(s * 0.27) * 0.004).toFixed(4));
      var target = 0;
      if (fine && px >= 0) {
        var r = m.el.getBoundingClientRect();
        var dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
        var near = Math.max(0, 1 - Math.hypot(dx, dy) / (window.innerWidth * 0.6));
        target = Math.max(-1, Math.min(1, dx / (window.innerWidth * 0.4))) * 14 * (0.35 + near);
      }
      m.lean += (target - m.lean) * 0.06;
      m.disp.setAttribute('scale', (8 + Math.sin(s * 0.9) * 3 + Math.abs(m.lean) * 0.5).toFixed(2));
      m.steam.style.transform = 'skewX(' + (-m.lean).toFixed(2) + 'deg)';
    }
    if (any) raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf && !reduce) raf = requestAnimationFrame(loop); }

  function mount(el, opts) {
    opts = opts || {};
    var modeAttr = opts.mode || el.getAttribute('data-ds-mark');
    var m = build(el, opts.part || el.getAttribute('data-part') || (modeAttr === 'progress' ? 'ghost' : null));
    m.steam.style.transformBox = 'view-box';
    m.steam.style.transformOrigin = m.originX + 'px ' + m.originY + 'px';
    el.classList.add('ds-mark');
    live.push(m);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { m.visible = e.isIntersecting; if (e.isIntersecting) kick(); });
    });
    io.observe(el);
    m.draw = function () {
      if (m.drawn) return;
      m.drawn = true;
      if (reduce) { setOffset(m, 0); el.classList.add('drawn'); return; }
      el.classList.add('drawing');
      requestAnimationFrame(function () { setOffset(m, 0); el.classList.add('drawn'); kick(); });
    };
    m.progress = function (p) {
      p = Math.max(0, Math.min(1, p));
      if (!reduce) setOffset(m, (1 - p).toFixed(4));
    };
    var mode = opts.mode || el.getAttribute('data-ds-mark') || 'load';
    if (reduce) m.draw();
    else if (mode === 'load') setTimeout(m.draw, opts.delay || 250);
    else if (mode === 'view') {
      var vo = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { m.draw(); vo.disconnect(); } });
      }, { threshold: 0.4 });
      vo.observe(el);
    }
    return m;
  }

  if (fine && !reduce) {
    window.addEventListener('pointermove', function (e) { px = e.clientX; py = e.clientY; kick(); }, { passive: true });
  }

  window.DSMark = { mount: mount };
  // The homepage loads this synchronously right after the loader (so the loader
  // can draw with the frame load), before the nav and footer exist: auto-mount
  // must wait for the document to finish parsing.
  function autoMount() {
    var auto = document.querySelectorAll('[data-ds-mark]');
    for (var i = 0; i < auto.length; i++) {
      var el = auto[i];
      if (el.getAttribute('data-ds-mark') !== 'progress' && !el.firstChild) mount(el);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount);
  else autoMount();
})();
