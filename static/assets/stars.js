// Live GitHub star count. Shows the number only when the fetch works; never a hard-coded number.
// Usage: <span data-stars hidden></span>  (any number of them). The element stays hidden on failure.
(function () {
  var KEY = 'pots-stars', TTL = 10 * 60 * 1000;
  function show(n) {
    var text = n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k' : String(n);
    document.querySelectorAll('[data-stars]').forEach(function (el) {
      el.textContent = text; el.hidden = false; el.setAttribute('aria-label', n + ' GitHub stars');
    });
    document.documentElement.classList.add('has-stars');
  }
  try {
    var c = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (c && Date.now() - c.t < TTL && typeof c.n === 'number') { show(c.n); return; }
  } catch (e) {}
  fetch('https://api.github.com/repos/Crokily/pi-durable-bot', { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      if (typeof d.stargazers_count !== 'number') return;
      show(d.stargazers_count);
      try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), n: d.stargazers_count })); } catch (e) {}
    })
    .catch(function () { /* no number shown */ });
})();
