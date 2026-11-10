# Content files for pots.sh sub-pages

`build.mjs` turns each file here into an HTML page and a Markdown twin. Text only: no HTML tags in any string.
Inline code may be written with backticks; links only in the fields that take `{label, url}`.

## Comparison page: `<slug>.json` (slug = the URL path, e.g. `grok-bot-alternative`)

```json
{
  "type": "compare",
  "slug": "grok-bot-alternative",
  "rival": "Grok Bot",
  "maker": "SpaceXSI (formerly xAI)",
  "title": "<= 65 characters, starts with '<Rival> alternative'",
  "description": "140 to 160 characters",
  "checked": "2026-11-10",
  "h1": ["The open-source", "Grok Bot alternative."],
  "claim": "One or two sentences under the H1.",
  "answer": "Short answer box: three sentences. What Pots is, what the rival is, the main difference.",
  "rivalIs": { "text": "Three or four neutral sentences about the rival.", "sources": [{ "label": "x.ai/bot", "url": "https://..." }] },
  "table": {
    "note": "One line: where the rival's cells come from.",
    "rows": [ { "label": "Source code", "pots": "Open, MIT", "rival": "Closed" } ]
  },
  "pickRival": ["Pick <Rival> if ... (2 to 4 short items, honest)"],
  "pickPots": ["2 to 4 short items"],
  "peers": { "intro": "One sentence.", "items": [ { "name": "repo or project name", "url": "https://github.com/...", "note": "One short line." } ] },
  "faq": [ { "q": "Is Grok Bot open source?", "a": "One or two sentences." } ],
  "sources": [ { "label": "Grok Bot product page", "url": "https://..." } ]
}
```

`h1` is two lines: the first is shown in a soft tone, the second in full ink.
`table.rows`: the first six rows are the same on every page, in this order and with these labels:
Source code · Where it runs · Model · Where you talk to it · Your data · Change the agent itself.
After them, 0 to 3 rows that matter for this rival.

## Hub: `alternatives.json`

```json
{
  "type": "hub", "slug": "alternatives",
  "title": "", "description": "", "checked": "2026-11-10",
  "h1": ["soft line", "solid line"], "claim": "",
  "cards": [ { "slug": "grok-bot-alternative", "rival": "Grok Bot", "maker": "SpaceXSI (formerly xAI)", "line": "One line." } ],
  "note": "The method line and the not-affiliated sentence."
}
```

## Agents page: `agents.json`

```json
{
  "type": "agents", "slug": "agents",
  "title": "", "description": "",
  "h1": ["soft line", "solid line"], "claim": "",
  "steps": [ { "title": "Short step title", "text": "One or two sentences.", "code": "optional command" } ],
  "rules": ["Short rules for the agent, from for-agents.md"],
  "links": [ { "label": "for-agents.md on GitHub", "url": "https://..." } ]
}
```

## Plain files

- `llms.txt`: served as `/llms.txt`.
- `home.md`: served as `/index.md`, the Markdown twin of the home page.
