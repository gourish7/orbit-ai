# orbit-ai

> One command to launch any AI coding assistant — Claude Code, OpenAI Codex, Ollama

**orbit** is a universal AI coding assistant launcher for developers who use multiple AI tools. Instead of remembering different commands, managing multiple accounts, and setting environment variables — just type `orbit`.

![npm](https://img.shields.io/npm/v/orbit-ai)
![license](https://img.shields.io/npm/l/orbit-ai)
![node](https://img.shields.io/node/v/orbit-ai)
![platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue)

---

![orbit demo](demo/demo.svg)

---

## Features

- **Multi-account Claude Code** — switch between work, personal, and client accounts without re-logging in
- **OpenAI Codex** — launch with your API key automatically
- **Ollama** — run local AI models with no internet required
- **Setup wizard** — guided first-run experience, detects what's installed and offers to install what's missing
- **Shared sessions** — project conversations are shared across all your Claude accounts
- **Cross-platform** — works on macOS, Linux, and Windows (WSL/Git Bash)

---

## Install

```bash
npm install -g orbit-ai
```

> Requires Node.js 18+

---

## Quick Start

Run `orbit` for the first time and the setup wizard will guide you through everything:

```bash
orbit
```

The wizard will:
1. Ask which AI tools you use
2. Check if they're installed (and offer to install them)
3. Add your first Claude account
4. Show you the welcome screen

---

## Usage

```bash
orbit                # Launch the assistant selector
orbit --add          # Add a Claude Code account
orbit --remove       # Remove a Claude Code account
orbit --add-model    # Add an Ollama model to the list
orbit --setup        # Re-run the setup wizard
orbit --list         # List all accounts & models
orbit --version      # Show version and detected providers
orbit --help         # Show the welcome screen
```

---

## Supported Providers

| Provider | Description | Install |
|---|---|---|
| [Claude Code](https://claude.ai/code) | Anthropic's AI pair programmer | `npm install -g @anthropic-ai/claude-code` |
| [OpenAI Codex](https://github.com/openai/codex) | GPT-4o powered coding assistant | `npm install -g @openai/codex` |
| [Ollama](https://ollama.com) | Local AI models, no internet required | [ollama.com](https://ollama.com) |

You don't need all three — orbit works with whichever ones you have installed.

---

## Multiple Claude Accounts

If you work across multiple clients or projects, orbit lets you maintain separate Claude accounts with isolated configurations and shared project sessions:

```bash
orbit --add
# Account name: work
# Email: you@work.com

orbit --add
# Account name: personal
# Email: you@gmail.com
```

Each account has its own credentials. Project conversations are shared across accounts so you never lose context when switching.

---

## Ollama (Local Models)

Select any locally available Ollama model from the launcher. orbit uses Claude Code as the frontend for Ollama, so the experience is identical.

```bash
orbit --add-model
# Model name: llama3:8b
```

---

## Data

All configuration is stored in `~/.orbit/`:

```
~/.orbit/
├── accounts.json       # Claude account registry
├── config.json         # Setup state and enabled providers
├── ollama-models.json  # Ollama model list
└── projects/           # Shared project sessions
```

No credentials are stored in the package — everything stays on your machine.

---

## Contributing

PRs and issues welcome at [github.com/gourish7/orbit-ai](https://github.com/gourish7/orbit-ai).

---

## License

MIT © [Gourishankar R Pujar](https://github.com/gourish7)
