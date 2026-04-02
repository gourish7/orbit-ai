import { existsSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';

const IS_WINDOWS = process.platform === 'win32';
const IS_MAC     = process.platform === 'darwin';

// ── which ────────────────────────────────────────────────────────────────────

export function which(cmd) {
    const exts = IS_WINDOWS ? (process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM').split(';') : [''];
    const dirs  = (process.env.PATH || '').split(IS_WINDOWS ? ';' : ':');
    for (const dir of dirs) {
        for (const ext of exts) {
            const full = join(dir, cmd + ext);
            if (existsSync(full)) return full;
        }
    }
    return null;
}

// ── Provider registry ─────────────────────────────────────────────────────────

export const PROVIDERS = {
    claude: {
        id:          'claude',
        label:       'Claude Code',
        tagline:     'Anthropic — multi-account AI pair programmer',
        cmd:         'claude',
        installCmd() {
            return 'npm install -g @anthropic-ai/claude-code';
        },
    },
    codex: {
        id:      'codex',
        label:   'OpenAI Codex',
        tagline: 'GPT-4o powered coding assistant',
        cmd:     'codex',
        installCmd() {
            return 'npm install -g @openai/codex';
        },
    },
    ollama: {
        id:      'ollama',
        label:   'Ollama',
        tagline: 'Local models — no internet required',
        cmd:     'ollama',
        installCmd() {
            if (IS_MAC)     return 'brew install ollama';
            if (IS_WINDOWS) return 'winget install Ollama.Ollama';
            return 'curl -fsSL https://ollama.com/install.sh | sh';
        },
    },
};

export function detect() {
    const result = {};
    for (const [id, p] of Object.entries(PROVIDERS)) {
        result[id] = which(p.cmd);
    }
    return result;  // { claude: '/path/...' | null, codex: ..., ollama: ... }
}

// ── Install a provider ────────────────────────────────────────────────────────

export function install(providerId) {
    const cmd = PROVIDERS[providerId].installCmd();
    const parts = cmd.split(' ');
    const result = spawnSync(parts[0], parts.slice(1), {
        stdio:  'inherit',
        shell:  IS_WINDOWS,
    });
    return result.status === 0;
}
