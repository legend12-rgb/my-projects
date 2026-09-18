/* ===========================================================================
   DOUBLESHOT scroll track (2026-09-13). Replaces the runner, on the client's
   request: "I do not like the person ... down when I'm scrolling I want to see a
   doughnut rolling."
   A small doughnut on a hairline at the bottom of the screen. Its position is your
   progress down the page, and it turns by exactly the distance it travels (rolling
   without slipping), so it rolls back when you scroll up and stops when you stop.
   It arrives at the steaming cup at the end of the page. On the homepage the track
   waits until the film is over (#runs). Reduced motion: positioned, no roll.
   =========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  // drawn here (viewBox -20..20): toasted dough ring with a real hole, a wavy bone
  // glaze, sprinkles in the site's camel and green
  function circ(r) { return 'M' + (-r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0Z'; }
  var wave = '';
  for (var k = 0; k <= 72; k++) {
    var a = k / 72 * Math.PI * 2, r = 15.1 + 1.25 * Math.sin(a * 9);
    wave += (k ? 'L' : 'M') + (r * Math.cos(a)).toFixed(2) + ' ' + (r * Math.sin(a)).toFixed(2);
  }
  var SPR = [[20, 12, '#C6A472'], [62, 11.5, '#0A2111'], [104, 12.6, '#C6A472'], [146, 11.2, '#0A2111'],
             [188, 12.4, '#C6A472'], [228, 11.6, '#0A2111'], [270, 12.8, '#C6A472'], [312, 11.4, '#0A2111'], [346, 12.2, '#0A2111']];
  var sprinkles = SPR.map(function (s, i) {
    var t = s[0] * Math.PI / 180, x = s[1] * Math.cos(t), y = s[1] * Math.sin(t), rot = s[0] + (i % 2 ? 50 : -35);
    return '<line x1="-1.5" y1="0" x2="1.5" y2="0" stroke="' + s[2] + '" stroke-width="1.5" stroke-linecap="round" ' +
           'transform="translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') rotate(' + rot + ')"/>';
  }).join('');
  var SVG = '<svg viewBox="-20 -20 40 40" aria-hidden="true" focusable="false">' +
    '<path fill="#B07C45" fill-rule="evenodd" d="' + circ(19) + circ(6.2) + '"/>' +
    '<path fill="none" stroke="rgba(0,0,0,.22)" stroke-width=".8" d="' + circ(18.4) + '"/>' +
    '<path fill="#F1EDE4" fill-rule="evenodd" d="' + wave + 'Z' + circ(8.3) + '"/>' +
    sprinkles + '</svg>';

  var track = document.createElement('div');
  track.id = 'run-track';
  track.setAttribute('aria-hidden', 'true');
  track.innerHTML = '<div class="rt-line"><i></i></div><div class="rt-donut"><div class="rt-spin">' + SVG + '</div></div>' +
                    '<span class="rt-cup" data-ds-mark="load"></span>';
  document.body.appendChild(track);
  var fill = track.querySelector('.rt-line i');
  var dn = track.querySelector('.rt-donut');
  var spin = track.querySelector('.rt-spin');
  var cup = track.querySelector('.rt-cup');
  if (window.DSMark) window.DSMark.mount(cup, { mode: 'load', delay: 0 });
  var runsSec = document.getElementById('runs');   // homepage: wait for the film to end

  var shown = false, lastX = -1;
  function frame() {
    var y = window.scrollY;
    var start = 0;
    if (runsSec) start = Math.max(0, runsSec.getBoundingClientRect().top + y - window.innerHeight * 0.4);
    var end = document.documentElement.scrollHeight - window.innerHeight - 2;
    var p = end > start ? Math.max(0, Math.min(1, (y - start) / (end - start))) : 0;
    var show = runsSec ? y > start : y > window.innerHeight * 0.1;
    if (show !== shown) { shown = show; track.classList.toggle('on', show); }
    if (!shown) return;
    var tw = track.clientWidth, dw = dn.offsetWidth, cw = cup.offsetWidth;
    var x = p * Math.max(0, tw - dw - cw - 6);
    if (Math.abs(x - lastX) < 0.05) return;   // idle: write nothing
    lastX = x;
    dn.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    // rolling without slipping: angle = distance / radius
    if (!reduce) spin.style.transform = 'rotate(' + (x / (dw / 2) * 57.2958).toFixed(1) + 'deg)';
    fill.style.transform = 'scaleX(' + (tw ? ((x + dw * 0.5) / (tw - cw)).toFixed(4) : 0) + ')';
    track.classList.toggle('arrived', p > 0.985);
  }
  if (typeof gsap !== 'undefined') gsap.ticker.add(frame);
  else (function loop() { frame(); requestAnimationFrame(loop); })();
})();
