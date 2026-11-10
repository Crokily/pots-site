/* pots.sh sub-pages: the creature, the copy buttons and the light behind the page.
   The home page has its own script (home.js). */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  function $$(s, c) { return [].slice.call((c || d).querySelectorAll(s)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* soft light behind the page (the same ground as the home page) */
  var sky = d.createElement('div');
  sky.className = 'sky'; sky.setAttribute('aria-hidden', 'true');
  sky.innerHTML = '<i class="sky-dawn"></i><i class="sky-grain"></i>';
  d.body.insertBefore(sky, d.body.firstChild);

  /* the creature: the logo, as inline SVG so it can look around */
  var HUES = { brand: ['#7FA8FF', '#C9C6FF', '#FFD3B8'] }, uid = 0;
  function eye(cx) {
    return '<g class="p-eye"><ellipse cx="' + cx + '" cy="88" rx="8.5" ry="13"/>' +
      '<path class="p-arc" d="M' + (cx - 9) + ' 94a9 11 0 0 1 18 0"/>' +
      '<path class="p-x" d="M' + (cx - 7) + ' 81l14 14m0-14l-14 14"/></g>';
  }
  function svg(bare) {
    var id = 'pg' + (++uid), c = HUES.brand;
    return '<span class="pots-pose"><svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">' +
      (bare ? '' : '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2=".2" y2="1"><stop offset="0" stop-color="' + c[0] +
        '"/><stop offset=".6" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + c[2] + '"/></linearGradient></defs>' +
        '<rect width="200" height="200" rx="48" fill="url(#' + id + ')"/>') +
      '<g class="p-body"><rect x="30" y="56" width="140" height="64" rx="32" fill="#fff"/>' +
      '<rect x="58" y="98" width="28" height="64" rx="14" fill="#fff"/>' +
      '<path d="M128 102V148Q128 156 136 156" stroke="#fff" stroke-width="28" stroke-linecap="round" fill="none"/>' +
      '<g class="p-eyes">' + eye(82) + eye(118) + '</g></g></svg></span>';
  }
  var all = $$('[data-pots]').map(function (el) {
    el.innerHTML = svg(el.hasAttribute('data-bare'));
    el.setAttribute('aria-hidden', 'true');
    var look = el.dataset.look ? d.querySelector(el.dataset.look) : null;
    return { el: el, eyes: el.querySelector('.p-eyes'), look: look, lx: 0, ly: 0, wx: 0, wy: 0, wt: 0, vis: false, quiet: !!el.closest('.hdr') };
  });
  function pose(c, p, e) { c.el.dataset.pose = p; if (e) c.el.dataset.eyes = e; else delete c.el.dataset.eyes; }

  var pointer = { x: 0, y: 0, t: -1e9 };
  if (fine) addEventListener('pointermove', function (e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = performance.now(); }, { passive: true });

  /* a creature with data-cheer is happy while that button is hovered or focused */
  all.forEach(function (c) {
    (c.el.dataset.cheer ? $$(c.el.dataset.cheer) : []).forEach(function (b) {
      function on() { pose(c, 'perk', 'happy'); } function off() { pose(c, 'idle', ''); }
      b.addEventListener('pointerenter', on); b.addEventListener('focus', on);
      b.addEventListener('pointerleave', off); b.addEventListener('blur', off);
    });
  });

  function eyes(now) {
    for (var i = 0; i < all.length; i++) {
      var c = all[i]; if (!c.vis) continue;
      var r = c.el.getBoundingClientRect(); if (!r.width) continue;
      var p = null, tx, ty;
      if (now - pointer.t < 2600) p = pointer;
      else if (c.look) { var lr = c.look.getBoundingClientRect(); if (lr.width) p = { x: lr.left + lr.width / 2, y: lr.top + lr.height / 2 }; }
      if (p) {
        var dx = p.x - (r.left + r.width / 2), dy = p.y - (r.top + r.height * .44);
        var dist = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, dist / (r.width * 1.1));
        tx = dx / dist * 9.5 * k; ty = dy / dist * 6.5 * k;
      } else {
        if (now > c.wt) { c.wx = (Math.random() * 2 - 1) * 7; c.wy = (Math.random() * 2 - 1) * 3.5; c.wt = now + 1100 + Math.random() * 2600; }
        tx = c.wx; ty = c.wy;
      }
      c.lx = lerp(c.lx, tx, .16); c.ly = lerp(c.ly, ty, .16);
      c.eyes.style.transform = 'translate(' + c.lx.toFixed(2) + 'px,' + c.ly.toFixed(2) + 'px)';
    }
  }
  var raf = 0, live = 0;
  function loop(now) { raf = 0; eyes(now); if (live > 0 && !d.hidden) raf = requestAnimationFrame(loop); }
  function kick() { if (!raf && !reduce && live > 0 && !d.hidden) raf = requestAnimationFrame(loop); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var c = all.filter(function (x) { return x.el === e.target; })[0]; if (!c) return;
        if (!c.quiet) live += (e.isIntersecting ? 1 : 0) - (c.vis ? 1 : 0);
        c.vis = e.isIntersecting; c.el.classList.toggle('is-vis', c.vis);
        /* it notices when it comes into view */
        if (c.vis && !reduce && c.el.hasAttribute('data-greet')) { pose(c, 'perk', 'wide'); setTimeout(function () { if (!c.el.dataset.eyes || c.el.dataset.eyes === 'wide') pose(c, 'idle', ''); }, 700); }
      });
      kick();
    }, { rootMargin: '40px' });
    all.forEach(function (c) { io.observe(c.el); });
  }
  d.addEventListener('visibilitychange', kick);
  if (!reduce) setInterval(function () {
    if (d.hidden) return;
    all.forEach(function (c) {
      if (!c.vis || Math.random() > .12) return;
      c.el.classList.add('is-blink'); setTimeout(function () { c.el.classList.remove('is-blink'); }, 130);
    });
  }, 520);

  /* copy buttons */
  $$('[data-copy]').forEach(function (b) {
    var lab = b.querySelector('.cmd-c,.cp-l') || b, old = lab.textContent, t = 0;
    b.addEventListener('click', function () {
      function done() { b.classList.add('is-copied'); lab.textContent = 'copied'; clearTimeout(t); t = setTimeout(function () { b.classList.remove('is-copied'); lab.textContent = old; }, 1500); }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(b.dataset.copy).then(done, function () {});
      else {
        var ta = d.createElement('textarea'); ta.value = b.dataset.copy; ta.style.cssText = 'position:fixed;left:-9999px;top:0';
        d.body.appendChild(ta); ta.select(); try { if (d.execCommand('copy')) done(); } catch (e) {} d.body.removeChild(ta);
      }
    });
  });
})();
