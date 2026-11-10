// pots.sh: builds dist/ from static/ and content/. No dependencies.
//   node build.mjs            local build; pages keep <meta name="robots" content="noindex">
//   node build.mjs --release  the build to deploy: no noindex, robots.txt allows crawling
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const RELEASE = process.argv.includes('--release');
const SITE = 'https://pots.sh';
const REPO = 'https://github.com/Crokily/pi-durable-bot';
const LEGAL = 'The other products as their makers described them in public, checked 2026-11-10; they may have changed since. Grok Bot, dots, Claude Duet, Claude Tag and Muse are products of SpaceXSI, OpenAI, Anthropic and Meta. pi-durable-bot is not affiliated with any of them.';
const RIVALS = [
  ['grok-bot-alternative', 'Grok Bot'], ['openai-dots-alternative', 'dots'], ['claude-duet-alternative', 'Claude Duet'],
  ['claude-tag-alternative', 'Claude Tag'], ['meta-muse-alternative', 'Muse'],
];

const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');
const out = (path, text) => { const f = join(ROOT, 'dist', path); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, text); };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rich = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');           // text with `inline code`
const date = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const links = (list) => list.map((l) => `<a href="${esc(l.url)}">${esc(l.label)}</a>`).join('');
const STAR = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 .9l2.1 4.4 4.8.6-3.5 3.3.9 4.8L8 11.7 3.7 14l.9-4.8L1.1 5.9l4.8-.6z"/></svg>';

/* ── the home page is the source of the header and the footer ── */
let home = read('static', 'index.html');
const grab = (re) => { const m = home.match(re); if (!m) throw new Error('home page: missing ' + re); return m[0]; };
const toRoot = (html) => html.replace(/href="#top"/g, 'href="/"').replace(/href="#/g, 'href="/#');
const HEADER = toRoot(grab(/<header class="hdr">[\s\S]*?<\/header>/));
const FOOTER = toRoot(grab(/<footer class="foot">[\s\S]*?<\/footer>/));
const FONTS = grab(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">[\s\S]*?rel="stylesheet">/);

const cta = (cheerId) => `<div class="cta-row">
      <a class="btn btn-ink" ${cheerId ? `id="${cheerId}" ` : ''}href="${REPO}">${STAR}<span>Star on GitHub</span><span class="count" data-stars hidden></span></a>
      <button class="cmd" type="button" data-copy="npm install -g pi-durable-bot" aria-label="Copy the install command: npm install -g pi-durable-bot"><span class="cmd-t"><span class="cmd-p" aria-hidden="true">$</span> npm install -g pi-durable-bot</span><span class="cmd-c" aria-hidden="true">copy</span></button>
    </div>`;
const more = (current) => `<nav class="vs" aria-label="More comparisons">${RIVALS.map(([slug, name]) =>
  `<a href="/${slug}"${slug === current ? ' aria-current="page"' : ''}>vs ${esc(name)}</a>`).join('')}<a href="/alternatives"${current === 'alternatives' ? ' aria-current="page"' : ''}>All alternatives</a></nav>`;
const end = (current) => `<section class="end">
    <span class="pots" data-pots data-greet data-cheer="#end-star"></span>
    <h2 class="pg-h2"><span class="h-a">Not a bot.</span> <span class="h-b">A coworker.</span></h2>
    ${cta('end-star')}
    ${more(current)}
  </section>`;

function page({ slug, title, description, body, jsonld = [] }) {
  const url = `${SITE}/${slug}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${RELEASE ? '' : '<meta name="robots" content="noindex">\n'}<link rel="canonical" href="${url}">
<link rel="alternate" type="text/markdown" href="${url}.md">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${SITE}/assets/social-preview.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/pots-logo.svg" type="image/svg+xml">
${FONTS}
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="/home.css">
<link rel="stylesheet" href="/pages.css">
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body class="subpage">
<a class="skip" href="#main">Skip to content</a>
${HEADER}
<main id="main">
${body}
</main>
${FOOTER}
<script src="/assets/stars.js" defer></script>
<script src="/pages.js" defer></script>
</body>
</html>
`;
}
const h1 = (lines) => `<h1 class="pg-h1"><span class="h-a">${esc(lines[0])}</span> <span class="h-b">${esc(lines[1])}</span></h1>`;
const crumbs = (items) => `<p class="crumbs">${items.join('')}</p>`;
const breadcrumb = (trail) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path })) });

/* ── content ── */
const CONTENT = readdirSync(join(ROOT, 'content')).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(read('content', f)));
const COMPARES = RIVALS.map(([slug]) => CONTENT.find((c) => c.slug === slug));
const SHARED = ['Source code', 'Where it runs', 'Model', 'Where you talk to it', 'Your data', 'Change the agent itself'];
for (const k of COMPARES) SHARED.forEach((l, i) => { if (k.table.rows[i].label !== l) throw new Error(`${k.slug}: row ${i + 1} must be "${l}"`); });

/* ── a comparison page ── */
function compare(c) {
  const body = `<section class="pg-hero"><div class="wrap">
    <span class="pots" data-pots data-greet data-look=".pg-h1 .h-b" data-cheer=".pg-hero .btn-ink"></span>
    ${crumbs([`<a href="/alternatives">Alternatives</a>`, `<span>${esc(c.rival)} · ${esc(c.maker)}</span>`, `<span>Facts checked ${date(c.checked)}</span>`])}
    ${h1(c.h1)}
    <p class="pg-claim">${rich(c.claim)}</p>
    ${cta()}
  </div></section>
<div class="pg">
  <section class="panel answer" aria-label="Short answer"><p class="pg-k">Short answer</p><p>${rich(c.answer)}</p></section>

  <section><h2 class="pg-h2">What ${esc(c.rival)} is</h2><p>${rich(c.rivalIs.text)}</p><p class="src">${links(c.rivalIs.sources)}</p></section>

  <section><h2 class="pg-h2">Pots and ${esc(c.rival)}, side by side</h2>
    <div class="vt-wrap"><span class="pots vt-pots" data-pots data-greet></span>
    <table class="vt"><caption class="vh">pi-durable-bot (Pots) compared with ${esc(c.rival)}</caption>
      <thead><tr><td></td><th scope="col" class="c-pots">pi-durable-bot (Pots)<small>Open source</small></th><th scope="col" class="c-rival">${esc(c.rival)}<small>${esc(c.maker)}</small></th></tr></thead>
      <tbody>
${c.table.rows.map((r) => `        <tr><th scope="row">${esc(r.label)}</th><td class="c-pots" data-who="Pots">${rich(r.pots)}</td><td class="c-rival" data-who="${esc(c.rival)}">${rich(r.rival)}</td></tr>`).join('\n')}
      </tbody></table></div>
    <p class="pg-note" style="margin-top:16px">${rich(c.table.note)}</p></section>

  <section class="pick" aria-label="Which one to pick">
    <div><h3>Pick ${esc(c.rival)} if</h3><ul>${c.pickRival.map((t) => `<li>${rich(t)}</li>`).join('')}</ul></div>
    <div class="pick-us"><h3>Pick Pots if</h3><ul>${c.pickPots.map((t) => `<li>${rich(t)}</li>`).join('')}</ul><a class="btn btn-ink" href="/#start">Quick start</a></div>
  </section>
${c.peers.items.length ? `
  <section><h2 class="pg-h2">Other open-source alternatives to ${esc(c.rival)}</h2><p>${rich(c.peers.intro)}</p>
    <ul class="peer-rows">${c.peers.items.map((p) => `<li><a href="${esc(p.url)}">${esc(p.name)}</a><span>${rich(p.note)}</span></li>`).join('')}</ul></section>` : ''}

  <section><h2 class="pg-h2">Questions</h2><dl class="faq">${c.faq.map((f) => `<div><dt>${esc(f.q)}</dt><dd>${rich(f.a)}</dd></div>`).join('')}</dl></section>

  <section><h2 class="pg-h2">Sources</h2><p class="src">${links(c.sources)}</p>
    <p class="pg-note" style="margin-top:14px">${esc(LEGAL)} Out of date? <a href="${REPO}/issues">Open an issue</a>.</p></section>

  ${end(c.slug)}
</div>`;
  const md = `# ${c.h1.join(' ')}

${c.claim}

Facts checked ${c.checked}. All comparisons: ${SITE}/alternatives.md

## Short answer

${c.answer}

## What ${c.rival} is

${c.rivalIs.text}

Sources: ${c.rivalIs.sources.map((s) => `[${s.label}](${s.url})`).join(', ')}

## Pots and ${c.rival}, side by side

| | pi-durable-bot (Pots) | ${c.rival} |
|---|---|---|
${c.table.rows.map((r) => `| ${r.label} | ${r.pots} | ${r.rival} |`).join('\n')}

${c.table.note}

## Pick ${c.rival} if

${c.pickRival.map((t) => `- ${t}`).join('\n')}

## Pick Pots if

${c.pickPots.map((t) => `- ${t}`).join('\n')}
${c.peers.items.length ? `
## Other open-source alternatives to ${c.rival}

${c.peers.intro}

${c.peers.items.map((p) => `- [${p.name}](${p.url}): ${p.note}`).join('\n')}
` : ''}
## Questions

${c.faq.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n')}

## Sources

${c.sources.map((s) => `- [${s.label}](${s.url})`).join('\n')}

${LEGAL}

## Get started

\`\`\`
npm install -g pi-durable-bot
pots init
\`\`\`

Repository: ${REPO} · For AI agents: ${SITE}/agents.md
`;
  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'WebPage', name: c.title, description: c.description, url: `${SITE}/${c.slug}`, dateModified: c.checked },
    breadcrumb([['Pots', '/'], ['Alternatives', '/alternatives'], [`${c.rival} alternative`, `/${c.slug}`]]),
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: c.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ];
  return { html: page({ slug: c.slug, title: c.title, description: c.description, body, jsonld }), md };
}

/* ── the hub ── */
function hub(c) {
  const body = `<section class="pg-hero"><div class="wrap">
    <span class="pots" data-pots data-greet data-cheer=".pg-hero .btn-ink"></span>
    ${crumbs([`<span>Alternatives</span>`, `<span>Facts checked ${date(c.checked)}</span>`])}
    ${h1(c.h1)}
    <p class="pg-claim">${rich(c.claim)}</p>
    ${cta()}
  </div></section>
<div class="pg">
  <nav class="hub" aria-label="Comparisons">${c.cards.map((k) => `<a href="/${esc(k.slug)}"><b>${esc(k.rival)}</b><small>${esc(k.maker)}</small><p>${rich(k.line)}</p><i>Pots vs ${esc(k.rival)} →</i></a>`).join('')}</nav>
</div>
<section class="wrap hub-all">
  <h2 class="pg-h2">All five, side by side</h2>
  <div class="cmp-wrap"><table class="cmp">
    <caption class="vh">pi-durable-bot (Pots) next to ${COMPARES.map((k) => esc(k.rival)).join(', ')}</caption>
    <thead><tr><th scope="col"><span class="vh">Product</span></th>${SHARED.map((l) => `<th scope="col">${esc(l)}</th>`).join('')}</tr></thead>
    <tbody>
      <tr class="cmp-pots"><th scope="row"><span class="pots" data-pots data-greet></span><span class="cmp-n">pi-durable-bot (Pots)</span><span class="cmp-m">Open source</span></th>${SHARED.map((l, i) => `<td data-l="${esc(l)}">${rich(COMPARES[0].table.rows[i].pots)}</td>`).join('')}</tr>
${COMPARES.map((k) => `      <tr><th scope="row"><a class="cmp-n" href="/${k.slug}">${esc(k.rival)}</a><span class="cmp-m">${esc(k.maker)}</span></th>${SHARED.map((l, i) => `<td data-l="${esc(l)}">${rich(k.table.rows[i].rival)}</td>`).join('')}</tr>`).join('\n')}
    </tbody></table></div>
  <p class="pg-note" style="margin-top:18px;max-width:60em">${rich(c.note)} Out of date? <a href="${REPO}/issues">Open an issue</a>.</p>
</section>
<div class="pg" style="padding-top:clamp(44px,5.5vw,76px)">
  ${end('alternatives')}
</div>`;
  const md = `# ${c.h1.join(' ')}

${c.claim}

Facts checked ${c.checked}.

${c.cards.map((k) => `- [Pots vs ${k.rival}](${SITE}/${k.slug}.md) (${k.maker}): ${k.line}`).join('\n')}

| | ${SHARED.join(' | ')} |
|---|${SHARED.map(() => '---').join('|')}|
| pi-durable-bot (Pots) | ${SHARED.map((l, i) => COMPARES[0].table.rows[i].pots).join(' | ')} |
${COMPARES.map((k) => `| ${k.rival} | ${SHARED.map((l, i) => k.table.rows[i].rival).join(' | ')} |`).join('\n')}

${c.note}

Repository: ${REPO}
`;
  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: c.title, description: c.description, url: `${SITE}/alternatives`, dateModified: c.checked },
    { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: c.cards.map((k, i) => ({ '@type': 'ListItem', position: i + 1, name: `Pots vs ${k.rival}`, url: `${SITE}/${k.slug}` })) },
  ];
  return { html: page({ slug: c.slug, title: c.title, description: c.description, body, jsonld }), md };
}

/* ── the page for AI agents ── */
function agents(c) {
  const body = `<section class="pg-hero"><div class="wrap">
    <span class="pots" data-pots data-greet></span>
    ${crumbs([`<span>For AI agents</span>`, `<a href="/agents.md">This page as Markdown</a>`, `<a href="/llms.txt">/llms.txt</a>`])}
    ${h1(c.h1)}
    <p class="pg-claim">${rich(c.claim)}</p>
  </div></section>
<div class="pg">
  <section><h2 class="pg-h2">The steps</h2>
    <ol class="steps">${c.steps.map((s) => `<li><b>${esc(s.title)}</b><p>${rich(s.text)}</p>${s.code ? `<div class="code"><code>${esc(s.code)}</code><button type="button" data-copy="${esc(s.code)}" aria-label="Copy: ${esc(s.code)}">copy</button></div>` : ''}</li>`).join('')}</ol></section>
  <section class="panel"><h2 class="pg-h2">Rules</h2><ul class="ticks" style="margin-top:12px">${c.rules.map((r) => `<li>${rich(r)}</li>`).join('')}</ul></section>
  <section><h2 class="pg-h2">The full text</h2><p class="src">${links(c.links)}</p></section>
  ${end('')}
</div>`;
  const md = `# ${c.h1.join(' ')}

${c.claim}

## The steps

${c.steps.map((s, i) => `${i + 1}. **${s.title}.** ${s.text}${s.code ? `\n\n   \`\`\`\n   ${s.code}\n   \`\`\`` : ''}`).join('\n')}

## Rules

${c.rules.map((r) => `- ${r}`).join('\n')}

## The full text

${c.links.map((l) => `- [${l.label}](${l.url})`).join('\n')}
`;
  return { html: page({ slug: c.slug, title: c.title, description: c.description, body }), md };
}

/* ── build ── */
rmSync(join(ROOT, 'dist'), { recursive: true, force: true });
cpSync(join(ROOT, 'static'), join(ROOT, 'dist'), { recursive: true });

// home: absolute social image, canonical, Markdown twin; noindex only in a local build
home = home.replace(/<meta name="robots" content="noindex">\n?/, RELEASE ? '' : '<meta name="robots" content="noindex">\n')
  .replace('<meta property="og:image" content="/assets/social-preview.png">', `<meta property="og:image" content="${SITE}/assets/social-preview.png">\n<meta property="og:url" content="${SITE}/">\n<link rel="canonical" href="${SITE}/">\n<link rel="alternate" type="text/markdown" href="${SITE}/index.md">`);
out('index.html', home);

const paths = ['/'];
for (const c of CONTENT) {
  const r = c.type === 'compare' ? compare(c) : c.type === 'hub' ? hub(c) : c.type === 'agents' ? agents(c) : null;
  if (!r) throw new Error(c.slug + ': unknown type ' + c.type);
  out(`${c.slug}/index.html`, r.html);
  out(`${c.slug}.md`, r.md);
  paths.push('/' + c.slug);
}
out('llms.txt', read('content', 'llms.txt'));
out('index.md', read('content', 'home.md'));
out('robots.txt', RELEASE ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join('\n')}\n</urlset>\n`);
out('_headers', '/*.md\n  Content-Type: text/markdown; charset=utf-8\n/llms.txt\n  Content-Type: text/plain; charset=utf-8\n');
out('404.html', page({ slug: '404', title: 'Page not found · Pots', description: 'This page does not exist.',
  body: `<section class="pg-hero"><div class="wrap"><span class="pots" data-pots data-eyes="x"></span>${h1(['Nothing here.', 'Pots looked.'])}<p class="pg-claim">This page does not exist.</p><div class="cta-row"><a class="btn btn-ink" href="/">Go home</a></div></div></section>` })
  .replace(/<link rel="(canonical|alternate)"[^>]*>\n/g, ''));
console.log(`built ${paths.length} pages${RELEASE ? ' (release)' : ' (local, noindex)'}: ${paths.join(' ')}`);
