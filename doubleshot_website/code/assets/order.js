/* ===========================================================================
   DOUBLESHOT order box (nav). Markup is a <details>, so it already opens with
   no JS. This adds the two-step flow the client asked for: choose Zomato or
   Swiggy first, then the outlet; the outlet link opens that platform's page in
   a new tab. Closes on outside click, Escape, or once the page scrolls away.
   =========================================================================== */
(function () {
  'use strict';
  [].slice.call(document.querySelectorAll('details.order')).forEach(function (d) {
    var pop = d.querySelector('.order-pop');
    var sum = d.querySelector('summary');
    if (!pop || !sum) return;
    pop.classList.add('js');
    var secs = [].slice.call(pop.querySelectorAll('.op-sec'));

    function reset() {
      pop.classList.remove('picked');
      secs.forEach(function (s) { s.classList.remove('on'); });
    }
    [].slice.call(pop.querySelectorAll('[data-op]')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sec = pop.querySelector('.op-sec[data-op-sec="' + btn.getAttribute('data-op') + '"]');
        if (!sec) return;
        pop.classList.add('picked');
        secs.forEach(function (s) { s.classList.toggle('on', s === sec); });
        var first = sec.querySelector('a');
        if (first) first.focus();
      });
    });
    [].slice.call(pop.querySelectorAll('.op-back')).forEach(function (b) {
      b.addEventListener('click', function () {
        reset();
        var first = pop.querySelector('[data-op]');
        if (first) first.focus();
      });
    });

    var y0 = window.scrollY;
    sum.setAttribute('aria-expanded', 'false');
    d.addEventListener('toggle', function () {
      sum.setAttribute('aria-expanded', d.open ? 'true' : 'false');
      if (d.open) y0 = window.scrollY; else reset();
    });
    document.addEventListener('click', function (e) {
      if (d.open && !d.contains(e.target)) d.open = false;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && d.open) { d.open = false; sum.focus(); }
    });
    window.addEventListener('scroll', function () {
      if (d.open && Math.abs(window.scrollY - y0) > 120) d.open = false;
    }, { passive: true });
  });
})();
