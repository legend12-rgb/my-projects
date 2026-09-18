/* ===========================================================================
   DOUBLESHOT liquid photo reveal. One coffee ripple, used on every photo.

   Each photo gets its own SVG turbulence + displacement filter. On entry the
   displacement pours out (scale 90 -> 0) while the photo fades in, like an
   image settling under liquid; hover sends one ripple through it. The filter
   is removed once settled, so an idle photo costs nothing to paint.
   Lightest renderer that meets the brief (shader-for-interfaces): SVG filter,
   no WebGL context per image. Safari renders SVG filters on HTML poorly, and
   reduced motion gets a plain fade, so both skip the distortion.
   Cut-outs and the pinned full-screen scenes are deliberately excluded.
   =========================================================================== */
(function () {
  'use strict';
  var SEL = '.act figure img, .a3 figure img, .pair-img img, .step-in img, .loc-photo img, ' +
            '.ig-tile img, .rs-frame img';
  var imgs = [].slice.call(document.querySelectorAll(SEL));
  if (!imgs.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine = window.matchMedia('(pointer:fine)').matches;
  var safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  var useFilter = !reduce && !safari;

  var defs = null;
  if (useFilter) {
    var holder = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    holder.setAttribute('aria-hidden', 'true');
    holder.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    holder.appendChild(defs);
    document.body.appendChild(holder);
  }

  function tween(dur, fn, done) {
    var t0 = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur);
      fn(k);
      if (k < 1) requestAnimationFrame(step); else if (done) done();
    })(t0);
  }
  // outCubic, not outExpo: expo settled the pour in ~300ms, too fast to read as liquid
  var outExpo = function (k) { return 1 - Math.pow(1 - k, 3); };

  imgs.forEach(function (img, i) {
    img.classList.add('liq');
    var turb = null, disp = null, id = 'liq' + i;
    if (useFilter) {
      var f = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      f.setAttribute('id', id);
      f.setAttribute('x', '-10%'); f.setAttribute('y', '-10%');
      f.setAttribute('width', '120%'); f.setAttribute('height', '120%');
      f.innerHTML = '<feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="2" seed="' + (i + 3) + '"/>' +
                    '<feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G"/>';
      defs.appendChild(f);
      turb = f.firstChild; disp = f.lastChild;
    }
    var busy = false;
    function ripple(from, dur, fade) {
      if (!useFilter) { img.classList.add('liq-in'); return; }
      busy = true;
      img.style.filter = 'url(#' + id + ')';
      if (fade) img.classList.add('liq-in');
      tween(dur, function (k) {
        var e = outExpo(k);
        disp.setAttribute('scale', (from * (1 - e)).toFixed(2));
        turb.setAttribute('baseFrequency', (0.012 + 0.01 * (1 - e)).toFixed(4) + ' ' + (0.05 - 0.03 * e).toFixed(4));
      }, function () { img.style.filter = ''; busy = false; });
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.disconnect();
        ripple(90, 1700, true);
      });
    }, { threshold: 0.15 });
    io.observe(img);
    if (fine && useFilter) {
      img.addEventListener('pointerenter', function () { if (!busy && img.classList.contains('liq-in')) ripple(26, 1100, false); });
    }
  });
})();
