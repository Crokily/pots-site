# pots.sh

Source of [pots.sh](https://pots.sh), the website of [pi-durable-bot (Pots)](https://github.com/Crokily/pi-durable-bot): an open-source AI coworker that acts on its own.

## Build

No dependencies. Needs Node.js 20 or later.

```bash
node build.mjs            # local build into dist/, pages keep noindex
node build.mjs --release  # the build to deploy
```

- `static/`: the home page, styles, scripts and assets.
- `content/`: the text of the comparison pages, `/alternatives` and `/agents` (format in `content/SCHEMA.md`), the Markdown home page and `llms.txt`.
- `build.mjs`: writes every page and its Markdown twin to `dist/`.

Cloudflare Pages builds it with `node build.mjs --release` and serves `dist/`.

## License

MIT
