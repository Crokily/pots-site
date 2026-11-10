/* pots.sh home, version C: "The creature". Vanilla JS, no libraries.
   One creature. Scrolling changes its state:
   0 watches · 1 listens · 2 decides · 3 works · 4 speaks up · 5 remembers · 6 survives. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  var reduceQ = matchMedia('(prefers-reduced-motion: reduce)');
  var pinQ = matchMedia('(min-width: 1000px) and (min-height: 660px)');
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = reduceQ.matches;

  /* ------------------------------------------------------------------ */
  /* The creature: the logo, rebuilt as inline SVG so it can move.       */
  /* ------------------------------------------------------------------ */
  var HUES = {
    brand: ['#7FA8FF', '#C9C6FF', '#FFD3B8'],
    mint: ['#5CD2B4', '#B2EBD1', '#FFF0B5'],
    rose: ['#FF96AD', '#FFC2BE', '#FFE4B0'],
    violet: ['#9C84FF', '#D5B5FF', '#FFC6DD'],
    sun: ['#FFBB57', '#FFDB99', '#FFD3B8']
  };
  var uid = 0;
  function eye(cx) {
    return '<g class="p-eye"><ellipse cx="' + cx + '" cy="88" rx="8.5" ry="13"/>' +
      '<path class="p-arc" d="M' + (cx - 9) + ' 94a9 11 0 0 1 18 0"/>' +
      '<path class="p-x" d="M' + (cx - 7) + ' 81l14 14m0-14l-14 14"/></g>';
  }
  function potsSVG(hue, bare) {
    var id = 'pg' + (++uid), c = HUES[hue] || HUES.brand;
    return '<span class="pots-pose"><svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">' +
      (bare ? '' : '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2=".2" y2="1"><stop offset="0" stop-color="' + c[0] +
        '"/><stop offset=".6" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + c[2] + '"/></linearGradient></defs>' +
        '<rect width="200" height="200" rx="48" fill="url(#' + id + ')"/>') +
      '<g class="p-body"><rect x="30" y="56" width="140" height="64" rx="32" fill="#fff"/>' +
      '<rect x="58" y="98" width="28" height="64" rx="14" fill="#fff"/>' +
      '<path d="M128 102V148Q128 156 136 156" stroke="#fff" stroke-width="28" stroke-linecap="round" fill="none"/>' +
      '<g class="p-eyes">' + eye(82) + eye(118) + '</g></g></svg></span>';
  }

  var creatures = [];
  $$('[data-pots]').forEach(function (el) {
    el.innerHTML = potsSVG(el.dataset.hue, el.hasAttribute('data-bare'));
    el.setAttribute('aria-hidden', 'true');
    var c = { el: el, eyes: $('.p-eyes', el), lx: 0, ly: 0, vis: false, look: null, wx: 0, wy: 0, wt: 0,
      anchor: el.classList.contains('anchor'), passive: !!el.closest('.hdr') };
    el._c = c;
    creatures.push(c);
  });
  function pose(c, p, e) {
    if (!c) return;
    if (p !== null) c.el.dataset.pose = p;
    if (e !== undefined) { if (e) c.el.dataset.eyes = e; else delete c.el.dataset.eyes; }
  }
  function lookEl(el) {
    return function () { var r = el.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; };
  }

  var pointer = { x: 0, y: 0, t: -1e9 };
  if (finePointer) {
    addEventListener('pointermove', function (e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = performance.now(); }, { passive: true });
  }

  var visCount = 0;
  var cio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var c = e.target._c; if (!c) return;
      if (!c.passive) {                      // the header logo is always there: it must not keep the loop alive
        if (e.isIntersecting && !c.vis) visCount++;
        if (!e.isIntersecting && c.vis) visCount--;
      }
      c.vis = e.isIntersecting;
      c.el.classList.toggle('is-vis', c.vis);
    });
    kick();
  }, { rootMargin: '40px' }) : null;
  creatures.forEach(function (c) { if (cio) cio.observe(c.el); else { c.vis = true; if (!c.passive) visCount++; } });

  function updateEyes(now) {
    for (var i = 0; i < creatures.length; i++) {
      var c = creatures[i];
      if (!c.vis || (pinned && c.anchor)) continue;
      var r = c.el.getBoundingClientRect();
      if (!r.width) continue;
      var p = c.look ? c.look() : null, tx, ty;
      if (!p && now - pointer.t < 2600) p = pointer;
      if (p) {
        var dx = p.x - (r.left + r.width / 2), dy = p.y - (r.top + r.height * 0.44);
        var dist = Math.hypot(dx, dy) || 1, k = Math.min(1, dist / (r.width * 1.1));
        tx = dx / dist * 9.5 * k; ty = dy / dist * 6.5 * k;
      } else {
        if (now > c.wt) { c.wx = (Math.random() * 2 - 1) * 7; c.wy = (Math.random() * 2 - 1) * 3.5; c.wt = now + 1100 + Math.random() * 2600; }
        tx = c.wx; ty = c.wy;
      }
      c.lx = lerp(c.lx, tx, 0.16); c.ly = lerp(c.ly, ty, 0.16);
      c.eyes.style.transform = 'translate(' + c.lx.toFixed(2) + 'px,' + c.ly.toFixed(2) + 'px)';
    }
  }
  if (!reduce) {
    setInterval(function () {
      if (d.hidden) return;
      creatures.forEach(function (c) {
        if (!c.vis || Math.random() > 0.12) return;
        c.el.classList.add('is-blink');
        setTimeout(function () { c.el.classList.remove('is-blink'); }, 130);
      });
    }, 520);
  }

  /* ------------------------------------------------------------------ */
  /* The story                                                           */
  /* ------------------------------------------------------------------ */
  var story = $('.story'), stage = $('.stage'), hero = $('.hero'), copy = $('.hero-copy');
  var flyEl = $('#pots'), flyC = flyEl._c, heroAnchor = $('.anchor--hero'), heroC = heroAnchor._c;
  var steps = $$('.step'), anchors = [heroAnchor].concat(steps.map(function (s) { return $('.anchor', s); }));
  var chipsEl = $('.chips'), inbox = $('.inbox'), rowEls = $$('.row', inbox), railBtns = $$('.rail button');
  var TH = [0.5, 1.6, 2.7, 3.8, 4.9, 6.0], END = 7.1;   // in viewport heights; .story is 800vh tall
  var pinned = false, cur = 0, vh = innerHeight, storyTop = 0;
  var stageVis = true, heroVis = true;
  var anchorPos = [], slots = [], sp = 0, spT = 0, spSet = 0;
  var fly = { x: 0, y: 0, s: 1, tilt: 0, hop: 0, init: false };
  var timers = {}, dockTimer = 0, offTimers = {}, swapTimer = 0;

  function main() { return pinned ? flyC : heroC; }

  /* chips */
  var ORDER = [0, 3, 1, 6, 2, 8, 4, 5, 9, 7];
  var chips = $$('.chip', chipsEl).map(function (el, i) {
    return { el: el, i: i, job: el.hasAttribute('data-job'), row: el.dataset.row ? +el.dataset.row : -1,
      x: 0, y: 0, o: 0, r: 0, sc: 1, w: 0, h: 0, rot: (i % 2 ? 1 : -1) * (0.4 + (i * 37 % 28) / 28), init: false, verdict: null, s0: 0 };
  });
  var ring = { cx: 0, cy: 0, pts: [], L: 1, small: false, n: chips.length, heroW: 0 }, phase = 0.07;
  var focus = null, nextFocus = 0, fi = 0, focusTimers = [];

  function buildRing(a, b, n) {
    var N = 240, pts = [], L = 0, px = 0, py = 0;
    for (var i = 0; i <= N; i++) {
      var t = i / N * Math.PI * 2 - Math.PI / 2, c = Math.cos(t), s = Math.sin(t);
      var x = a * (c < 0 ? -1 : 1) * Math.pow(Math.abs(c), 2 / n), y = b * (s < 0 ? -1 : 1) * Math.pow(Math.abs(s), 2 / n);
      if (i) L += Math.hypot(x - px, y - py);
      pts.push({ x: x, y: y, l: L }); px = x; py = y;
    }
    ring.pts = pts; ring.L = L;
  }
  function pointAt(u) {
    var l = (((u % 1) + 1) % 1) * ring.L, pts = ring.pts, lo = 0, hi = pts.length - 1;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (pts[m].l < l) lo = m; else hi = m; }
    var A = pts[lo], B = pts[hi], f = (l - A.l) / ((B.l - A.l) || 1);
    return { x: A.x + (B.x - A.x) * f, y: A.y + (B.y - A.y) * f };
  }
  function rel(el, base) {
    var r = el.getBoundingClientRect();
    return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
  }

  function measure() {
    var wantPin = pinQ.matches && !reduce;
    if (wantPin !== pinned) { pinned = wantPin; root.classList.toggle('pinned', pinned); resetMode(); }
    vh = innerHeight;
    stage.style.setProperty('--sp', '0'); spSet = 0;
    storyTop = story.getBoundingClientRect().top + scrollY;

    // ring: big (around the whole headline) if there is room, else a small orbit around the creature
    root.classList.remove('ring-small');
    var maxW = 0, i, hr, cr, a, b;
    function sizeChips() { maxW = 0; chips.forEach(function (c) { c.w = c.el.offsetWidth; c.h = c.el.offsetHeight; maxW = Math.max(maxW, c.w); }); }
    sizeChips();
    hr = hero.getBoundingClientRect(); cr = rel(copy, hr);
    var ccx = cr.x + cr.w / 2, ccy = cr.y + cr.h / 2;
    var aAvail = hr.width / 2 - maxW / 2 - 20;
    var bAvail = Math.min(ccy - 70, hr.height - ccy - 8) - 24;
    var aNeed = cr.w / 2 + maxW / 2 + 54, bNeed = cr.h / 2 + 46;
    if (aAvail >= aNeed && bAvail >= bNeed) {
      ring.small = false;
      a = Math.min(aAvail, cr.w / 2 + maxW / 2 + 130); b = Math.min(bAvail, cr.h / 2 + 70);
      ring.cx = ccx; ring.cy = ccy; buildRing(a, b, 3.2);
    } else {
      ring.small = true; root.classList.add('ring-small');
      sizeChips(); hr = hero.getBoundingClientRect();
      var ar = rel(heroAnchor, hr);
      a = Math.min(hr.width / 2 - 24, 380); b = ar.h / 2 + 42;
      ring.cx = ar.x + ar.w / 2; ring.cy = ar.y + ar.h / 2; buildRing(a, b, 3.4);
    }
    ring.heroW = hr.width;
    ring.n = clamp(Math.floor(ring.L / (maxW + (ring.small ? 22 : 44))), 3, chips.length);
    chips.forEach(function (c) { c.s0 = c.i / ring.n; if (!(pinned && cur >= 1)) { c.init = false; c.o = 0; } });

    // each picture has a fixed design size; zoom it to fit its column
    steps.forEach(function (s) {
      var prop = $('.step-prop', s), box = prop.firstElementChild;
      if (innerWidth < 900) { box.style.removeProperty('--k'); return; }
      var k = Math.min(prop.clientWidth / +box.dataset.w, pinned ? prop.clientHeight / +box.dataset.h : 9);
      box.style.setProperty('--k', clamp(k, 0.5, 1.22).toFixed(3));
    });

    var sr = stage.getBoundingClientRect();
    anchorPos = anchors.map(function (el) { return rel(el, sr); });
    slots = rowEls.map(function (row) { var r = rel($('.chip', row), sr); return { x: r.x, y: r.y + r.h / 2 }; });
    if (!fly.init && anchorPos[0].w) {
      fly.x = anchorPos[0].x + anchorPos[0].w / 2; fly.y = anchorPos[0].y + anchorPos[0].h / 2; fly.s = anchorPos[0].w / 160; fly.init = true;
    }
    if (reduce) placeChipsStatic();
    if (pinned) onScroll(); else placeFly();
    kick();
  }

  function placeChipsStatic() {
    chips.forEach(function (c) {
      var p = pointAt(c.s0 + phase), on = c.i < ring.n;
      c.x = ring.cx + p.x; c.y = ring.cy + p.y;
      c.el.style.transform = 'translate3d(' + (c.x - c.w / 2).toFixed(1) + 'px,' + (c.y - c.h / 2).toFixed(1) + 'px,0) rotate(' + c.rot.toFixed(1) + 'deg)';
      var o = on ? (c.job ? 1 : (c.i % 3 === 1 ? 0.4 : 1)) : 0;
      if (ring.small) o *= clamp(1 - ((Math.abs(p.x) + c.w / 2) - ring.heroW / 2 + 6) / (c.w * 0.55), 0, 1);
      c.el.style.opacity = o.toFixed(2);
      c.el.classList.toggle('is-job', on && c.i === 0);
      if (on && c.i === 0) c.el.style.transform += ' scale(1.1)';
    });
  }

  function updateChips(now, dt) {
    var docking = pinned && cur >= 1;
    if (pinned ? cur > 1 : !heroVis) return;
    if (!docking) phase += dt * (ring.small ? 20 : 24) / ring.L;
    for (var i = 0; i < chips.length; i++) {
      var c = chips[i], p = pointAt(c.s0 + phase), tx, ty, to, tr = c.rot, k = 0.085;
      tx = ring.cx + p.x; ty = ring.cy + p.y + Math.sin(now / 1700 + c.i * 1.9) * (ring.small ? 3 : 6);
      to = c.i < ring.n ? 1 : 0;
      if (ring.small) to *= clamp(1 - ((Math.abs(tx - ring.cx) + c.w / 2) - ring.heroW / 2 + 6) / (c.w * 0.55), 0, 1);
      if (c.verdict === 'quiet') to *= 0.3;
      if (docking) {
        k = 0.14; tr = 0;
        if (c.row >= 0 && slots[c.row]) { tx = slots[c.row].x + c.w / 2; ty = slots[c.row].y - sp * 16; to = 1; }
        else { tx = ring.cx + p.x * 1.7; ty = ring.cy + p.y * 1.7; to = 0; }
      }
      if (!c.init) { c.x = tx; c.y = ty; c.r = tr; c.init = true; }
      c.x = lerp(c.x, tx, k); c.y = lerp(c.y, ty, k); c.o = lerp(c.o, to, 0.09); c.r = lerp(c.r, tr, 0.1);
      c.sc = lerp(c.sc, docking ? 1 : c.verdict === 'job' ? 1.12 : c === focus && c.verdict === null ? 1.06 : 1, 0.16);
      c.el.style.transform = 'translate3d(' + (c.x - c.w / 2).toFixed(1) + 'px,' + (c.y - c.h / 2).toFixed(1) + 'px,0) rotate(' + c.r.toFixed(2) + 'deg) scale(' + c.sc.toFixed(3) + ')';
      c.el.style.opacity = c.o.toFixed(3);
    }
  }

  function later(ms, fn) { focusTimers.push(setTimeout(fn, ms)); }
  function tickFocus(now) {
    if ((pinned && cur !== 0) || !heroVis || now < nextFocus) return;
    var c = null, guard = 0;
    while (!c && guard++ < 12) { var cand = chips[ORDER[fi++ % ORDER.length]]; if (cand.i < ring.n && cand.o > 0.5) c = cand; }
    nextFocus = now + 1750;
    if (!c) return;
    focus = c; c.el.classList.add('is-reading');
    later(700, function () {
      c.el.classList.remove('is-reading');
      if (c.job) {
        c.verdict = 'job'; c.el.classList.add('is-job');
        if (cur === 0) pose(main(), 'perk', 'wide');
        later(900, function () { if (cur === 0) pose(main(), 'idle', ''); });
        later(2100, function () { c.el.classList.remove('is-job'); c.verdict = null; });
      } else {
        c.verdict = 'quiet';
        later(2700, function () { c.verdict = null; });
      }
    });
  }
  function focusLook() {
    if (performance.now() - pointer.t < 1100) return null;         // follow the pointer a little
    if (!focus) return null;
    var hr = hero.getBoundingClientRect();
    return { x: hr.left + focus.x, y: hr.top + focus.y };
  }
  function clearFocus() {
    focusTimers.forEach(clearTimeout); focusTimers = []; focus = null;
    chips.forEach(function (c) { c.verdict = null; c.el.classList.remove('is-reading', 'is-job'); });
  }

  /* the travelling creature (pinned mode) */
  function placeFly() {
    var a = anchorPos[cur]; if (!a) return;
    fly.x = a.x + a.w / 2; fly.y = a.y + a.h / 2; fly.s = a.w / 160;
  }
  function updateFly() {
    var a = anchorPos[cur]; if (!a || !a.w) return;
    var tx = a.x + a.w / 2, ty = a.y + a.h / 2 - (cur ? sp * 16 : 0), ts = a.w / 160, px = fly.x;
    var dist = Math.hypot(tx - fly.x, ty - fly.y);
    fly.x = lerp(fly.x, tx, 0.1); fly.y = lerp(fly.y, ty, 0.1); fly.s = lerp(fly.s, ts, 0.1);
    fly.tilt = lerp(fly.tilt, clamp((fly.x - px) * 1.2, -15, 15), 0.2);
    fly.hop = lerp(fly.hop, -Math.min(dist, 340) * 0.13, 0.16);
    flyEl.style.transform = 'translate3d(' + (fly.x - 80).toFixed(1) + 'px,' + (fly.y - 80 + fly.hop).toFixed(1) + 'px,0) rotate(' +
      fly.tilt.toFixed(2) + 'deg) scale(' + fly.s.toFixed(4) + ')';
  }

  /* timelines: each state plays in full when it is entered */
  function at(T, ms, fn) { if (reduce) fn(); else T.push(setTimeout(fn, ms)); }
  var SCRIPT = {
    1: function (T, c, step) {                                                   // it listens: it reads each message as it lands
      var rows = $$('.row', step);
      pose(c, 'lean-r', 'wide');
      rows.forEach(function (row, i) { at(T, 750 + i * 300, function () { c.look = lookEl(row); }); });
      at(T, 750 + rows.length * 300 + 200, function () { pose(c, 'lean-r', ''); });
    },
    2: function (T, c, step) {
      var rows = $$('.row', step), job = $('.row--job', step);
      pose(c, 'lean-r', '');
      rows.forEach(function (row) { at(T, +row.dataset.t - 160, function () { c.look = lookEl(row); }); });
      at(T, 1250, function () { pose(c, 'perk', 'wide'); c.look = lookEl(job); });   // this one is mine
      at(T, 2250, function () { pose(c, 'lean-r', 'happy'); });
      at(T, 3400, function () { pose(c, 'lean-r', ''); });
    },
    3: function (T, c, step) {
      var ptr = $('.ptr', step), kids = $('.kids', step), term = $('.tools', step);
      pose(c, 'lean-r', 'narrow'); c.look = lookEl(ptr);
      at(T, 500, function () { pose(c, 'lean-r', ''); c.look = lookEl(term); });
      at(T, 950, function () { pose(c, 'perk', ''); c.look = lookEl(kids); });
      at(T, 1900, function () { pose(c, 'lean-r', ''); c.look = lookEl(ptr); });
    },
    4: function (T, c, step) {
      var msgs = $$('.msg--pots', step), clock = $('.clock', step), page = $('.page', step);
      pose(c, 'idle', ''); c.look = lookEl(msgs[0]);
      at(T, 700, function () { pose(c, 'perk', 'wide'); });
      at(T, 1250, function () { pose(c, 'idle', ''); c.look = lookEl(page); });
      at(T, 1950, function () { c.look = lookEl(clock); });
      at(T, 3300, function () { pose(c, 'perk', ''); c.look = lookEl(msgs[1]); });
      at(T, 3850, function () { pose(c, 'idle', 'happy'); });
    },
    5: function (T, c, step) {
      var msg = $('.msg', step), news = $$('.files .new', step);
      pose(c, 'idle', ''); c.look = lookEl(msg);
      at(T, 800, function () { pose(c, 'perk', 'wide'); });                      // it heard something worth keeping
      at(T, 1450, function () { pose(c, 'lean-r', ''); c.look = lookEl(news[0]); });
      at(T, 1800, function () { c.look = lookEl(news[1]); });
      at(T, 2500, function () { pose(c, 'idle', 'happy'); });
      at(T, 3700, function () { pose(c, 'idle', ''); });
    },
    6: function (T, c, step) {
      var jr = $('.journal', step);
      pose(c, 'up', ''); c.look = lookEl(jr);
      at(T, 560, function () { pose(c, 'down', 'x'); });
      at(T, 1150, function () { pose(c, 'up', ''); });
      at(T, 1400, function () { pose(c, 'up', 'wide'); c.look = lookEl(jr); });
      at(T, 1800, function () { pose(c, 'up', 'happy'); });
    }
  };
  function clearTimers(k) { (timers[k] || []).forEach(clearTimeout); timers[k] = []; }
  function activate(step, c) {
    var k = +step.dataset.step, T;
    clearTimeout(offTimers[k]); clearTimers(k); T = timers[k];
    step.classList.add('is-active');
    $$('[data-t]', step).forEach(function (el) { at(T, +el.dataset.t, function () { el.classList.add('on'); }); });
    SCRIPT[k](T, c, step);
  }
  function deactivate(step) {
    var k = +step.dataset.step;
    if (!step.classList.contains('is-active')) return;
    clearTimers(k); step.classList.remove('is-active');
    offTimers[k] = setTimeout(function () { $$('[data-t]', step).forEach(function (el) { el.classList.remove('on'); }); }, 280);
  }

  function setState(k) {
    if (k === cur) return;
    // listens <-> decides: the same inbox stays on screen, only the words change
    clearTimeout(swapTimer);
    stage.classList.toggle('is-swap', (cur === 1 || cur === 2) && (k === 1 || k === 2));
    if (stage.classList.contains('is-swap')) swapTimer = setTimeout(function () { stage.classList.remove('is-swap'); }, 700);
    cur = k; stage.dataset.state = k;
    steps.forEach(function (s, i) { if (i + 1 === k) activate(s, flyC); else deactivate(s); });
    railBtns.forEach(function (b) { if (+b.dataset.go === k) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    clearTimeout(dockTimer);
    if (k >= 1) {
      clearFocus();
      dockTimer = setTimeout(function () { chipsEl.classList.add('is-docked'); inbox.classList.add('is-filled'); }, 620);
    } else {
      chipsEl.classList.remove('is-docked'); inbox.classList.remove('is-filled');
      // back to the ring: come in from outside, never across the headline
      chips.forEach(function (c) { var p = pointAt(c.s0 + phase); c.x = ring.cx + p.x * 1.5; c.y = ring.cy + p.y * 1.5; c.o = 0; c.r = c.rot; });
      pose(flyC, 'idle', ''); flyC.look = focusLook; nextFocus = performance.now() + 900;
    }
  }
  function onScroll() {
    if (!pinned) return;
    var p = (scrollY - storyTop) / vh, k = 0, i;
    for (i = 0; i < TH.length; i++) if (p >= TH[i]) k = i + 1;
    if (k) { var a = TH[k - 1], b = k < TH.length ? TH[k] : END; spT = clamp((p - a) / (b - a), 0, 1) * 2 - 1; } else spT = 0;
    setState(k);
  }
  function goTo(k) {
    var top = k === 0 ? storyTop : storyTop + (TH[k - 1] + 0.3) * vh;
    scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
  }

  /* flow mode: steps are a simple sequence; each plays once when it comes into view */
  var sio = null;
  function resetMode() {
    Object.keys(timers).forEach(clearTimers);
    clearTimeout(dockTimer); clearFocus();
    steps.forEach(function (s) { s.classList.remove('is-active'); $$('[data-t]', s).forEach(function (el) { el.classList.remove('on'); }); });
    chipsEl.classList.remove('is-docked');
    cur = 0; stage.dataset.state = 0; sp = spT = 0; fly.init = false;
    creatures.forEach(function (c) { if (c.anchor || c === flyC) { c.look = null; } });
    chips.forEach(function (c) { c.init = false; });
    if (sio) { sio.disconnect(); sio = null; }
    if (pinned) {
      inbox.classList.remove('is-filled');
      pose(flyC, 'idle', ''); flyC.look = focusLook;
    } else {
      inbox.classList.add('is-filled');
      pose(heroC, 'idle', ''); heroC.look = focusLook;
      if (reduce || !('IntersectionObserver' in window)) {
        steps.forEach(function (s) { activate(s, $('.anchor', s)._c); });
      } else {
        sio = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (!e.isIntersecting) return;
            var s = e.target.closest('.step');
            sio.unobserve(e.target); activate(s, $('.anchor', s)._c);
          });
        }, { threshold: 0.12 });
        steps.forEach(function (s) { sio.observe($('.step-prop', s)); });
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* One loop. It stops when nothing it moves is visible.                */
  /* ------------------------------------------------------------------ */
  var raf = 0, last = 0;
  function shouldRun() { return !reduce && !d.hidden && (stageVis || heroVis || visCount > 0); }
  function loop(now) {
    raf = 0;
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (pinned && stageVis) {
      sp = lerp(sp, spT, 0.07);
      if (Math.abs(sp - spSet) > 0.002) { spSet = sp; stage.style.setProperty('--sp', sp.toFixed(3)); }
      updateFly();
    }
    if (pinned ? stageVis : heroVis) { updateChips(now, dt); tickFocus(now); }
    updateEyes(now);
    if (shouldRun()) raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf && shouldRun()) { last = performance.now(); raf = requestAnimationFrame(loop); } }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { stageVis = es[0].isIntersecting; kick(); }).observe(stage);
    new IntersectionObserver(function (es) { heroVis = es[0].isIntersecting; kick(); }).observe(hero);
  }
  d.addEventListener('visibilitychange', function () { root.classList.toggle('is-hidden', d.hidden); kick(); });
  addEventListener('scroll', onScroll, { passive: true });
  var rz = 0;
  addEventListener('resize', function () { cancelAnimationFrame(rz); rz = requestAnimationFrame(measure); });
  function onReduce() { reduce = reduceQ.matches; measure(); }
  if (reduceQ.addEventListener) reduceQ.addEventListener('change', onReduce);

  /* navigation inside the pinned story */
  railBtns.forEach(function (b) { b.addEventListener('click', function () { goTo(+b.dataset.go); }); });
  $$('a[href="#how"],a[href="#top"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!pinned) return;
      e.preventDefault(); goTo(a.getAttribute('href') === '#how' ? 1 : 0);
      history.replaceState(null, '', a.getAttribute('href'));
    });
  });

  /* a star makes it happy */
  $$('a.btn-ink[href*="github.com"]').forEach(function (a) {
    var c = a.closest('.close') ? $('.close-pots')._c : null;
    function on() { if (c) pose(c, 'perk', 'happy'); else if (cur === 0) pose(main(), 'perk', 'happy'); }
    function off() { if (c) pose(c, 'idle', ''); else if (cur === 0) pose(main(), 'idle', ''); }
    a.addEventListener('pointerenter', on); a.addEventListener('pointerleave', off);
    a.addEventListener('focus', on); a.addEventListener('blur', off);
  });

  /* copy buttons */
  $$('[data-copy]').forEach(function (b) {
    var lab = $('.cmd-c', b) || b, old = lab.textContent, t = 0;
    b.addEventListener('click', function () {
      var text = b.dataset.copy;
      function done() { b.classList.add('is-copied'); lab.textContent = 'copied'; clearTimeout(t); t = setTimeout(function () { b.classList.remove('is-copied'); lab.textContent = old; }, 1500); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
      else {
        var ta = d.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-99px;top:0;opacity:0';
        d.body.appendChild(ta); ta.select(); try { d.execCommand('copy'); } catch (err) {} d.body.removeChild(ta); done();
      }
    });
  });

  /* start */
  pinned = !(pinQ.matches && !reduce);   // force the first measure() to set the mode up
  measure();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(measure);
  if ('ResizeObserver' in window) {          // the star count arrives later and can change the size of the first screen
    var cw = 0, ch = 0;
    new ResizeObserver(function (es) {
      var r = es[0].contentRect;
      if (Math.abs(r.width - cw) > 1 || Math.abs(r.height - ch) > 1) { cw = r.width; ch = r.height; cancelAnimationFrame(rz); rz = requestAnimationFrame(measure); }
    }).observe(copy);
  }
  /* C2: soft light behind the page, in the creature's colours. Its colour changes with the story. */
  (function () {
    var sky = d.createElement('div');
    sky.className = 'sky'; sky.setAttribute('aria-hidden', 'true');
    sky.innerHTML = '<i class="sky-dawn"></i><i class="sky-lilac"></i><i class="sky-peri"></i><i class="sky-peach"></i><i class="sky-dusk"></i><i class="sky-night"></i><i class="sky-grain"></i>';
    d.body.insertBefore(sky, d.body.firstChild);
    var MAP = ['dawn', 'lilac', 'lilac', 'peri', 'peach', 'dusk', 'night'], now = '', q = 0;
    function pick() {
      q = 0;
      var mid = innerHeight * 0.5, r = story.getBoundingClientRect(), v = 'dawn', i, sr;
      if (r.bottom < mid) v = 'dawn';
      else if (pinned) v = MAP[cur] || 'dawn';
      else for (i = 0; i < steps.length; i++) { sr = steps[i].getBoundingClientRect(); if (sr.top < mid && sr.bottom > mid) v = MAP[i + 1]; }
      if (v !== now) { now = v; root.dataset.sky = v; }
    }
    function ask() { if (!q) q = requestAnimationFrame(pick); }
    addEventListener('scroll', ask, { passive: true });
    addEventListener('resize', ask);
    new MutationObserver(ask).observe(stage, { attributes: true, attributeFilter: ['data-state'] });
    pick();
  })();

  addEventListener('load', measure);
  if (location.hash === '#how' && pinned) requestAnimationFrame(function () { goTo(1); });
})();
