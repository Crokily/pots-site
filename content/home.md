Not a bot. A coworker.

# The open-source Grok Bot alternative: an AI coworker that acts on its own.

pi-durable-bot (Pots) reads every channel you give it, works on its own computer, and speaks up when it should.

[Star on GitHub](https://github.com/Crokily/pi-durable-bot)

```sh
npm install -g pi-durable-bot
```

MIT · any model · any channel · any machine

Setting up with Claude Code, Codex or Cursor? Point it to [/agents](https://pots.sh/agents.md).

## Every channel. One inbox.

Slack, Discord, Telegram, email, calendar. Every message lands in its inbox, also the ones that never mention it.

## Nobody tagged it. It decides what is its job.

It reads every message. Mostly, the right answer is to stay quiet.

## Then it goes to its own computer.

It writes the script it needs, and hands long work to helpers.

shell · files · internet · screen, mouse, keyboard

## It speaks up. Nobody asked.

It writes a page when a message is not enough, and comes back at 5 pm, as it promised.

## Say it once. It remembers.

One memory across every channel, kept as plain files you can read.

## Knock it over. It gets up.

Kill it mid-task and it continues after restart, without sending the same message twice. On Telegram, a crash mid-send can repeat it.


## Run a whole team of them. They are yours.

One machine runs several bots, each with its own name, persona, responsibilities and memory.

- **Any model.** Your subscription, 40+ providers, or a local model.
- **Any channel.** Slack, Discord, Telegram, and more.
- **Any machine.** A laptop, a server or a VM.
- **MIT.** The agent itself is yours: read it, fork it, change it.

## Like Grok Bot. Open source.

| | pi-durable-bot (Pots) | Grok Bot |
|---|---|---|
| Source code | Open, MIT | Closed |
| Where it runs | Any machine you choose | The maker's cloud (Cursor account) |
| Model | Any: your subscription, 40+ providers, or a local model | The maker picks per task; no model picker |
| Where you talk to it | Any channel (Slack, Discord, Telegram, and more) | Desktop and mobile apps, X; Slack for team bots |
| Your data | On your machine, in each bot's folder | On the maker's cloud |

Grok Bot as SpaceXSI describes it in public, checked 2026-11-10. Sources and the full comparison: [Pots vs Grok Bot](https://pots.sh/grok-bot-alternative.md).

More comparisons: [OpenAI dots](https://pots.sh/openai-dots-alternative.md) · [Claude Duet](https://pots.sh/claude-duet-alternative.md) · [Claude Tag](https://pots.sh/claude-tag-alternative.md) · [Meta Muse](https://pots.sh/meta-muse-alternative.md) · [all alternatives](https://pots.sh/alternatives.md)

## Its first day: three steps.

1. **Install it.** `npm install -g pi-durable-bot`
2. **Make your bot.** `pots init`. Give it a name, a model and one sentence about its job.
3. **Invite it to your channels.** Tell it "join our Slack" in `pots chat`. It sets the app up itself.

Needs Node.js 24+. macOS, Linux, Windows.

It gets full control of the computer it runs on. Give it a computer or VM of its own.

## Claude Code, Codex, Cursor: this part is for you.

Start at [/agents](https://pots.sh/agents.md). You install Pots and make the bot. Your person signs in with `pots login`. The bot connects its own chat apps.

Person with an agent? Give it this: "Read https://pots.sh/agents first, then set up Pots for me."

## Not a bot. A coworker.

If Pots is useful to you, a star helps other people find it: https://github.com/Crokily/pi-durable-bot

Grok Bot, dots, Claude Duet, Claude Tag and Muse are products of SpaceXSI, OpenAI, Anthropic and Meta. pi-durable-bot is not affiliated with any of them.
