import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { readMemory } from './config.js';

const ORBIT_HEADER = '<!-- orbit-managed: do not edit — use `orbit --memory` instead -->\n\n';

/**
 * Inject orbit memory into the appropriate file for the selected provider/account.
 * Safe to call even if ~/.orbit/memory.md doesn't exist — it's a no-op in that case.
 */
export function applyMemory(type, acc) {
    const memory = readMemory();
    if (!memory) return;

    switch (type) {
        case 'claude':
        case 'ollama':
            applyClaude(acc, memory);
            break;
        case 'codex':
            applyCodex(memory);
            break;
    }
}

// ── Claude / Ollama ───────────────────────────────────────────────────────────
// Writes to $CLAUDE_CONFIG_DIR/CLAUDE.md
// Account-specific additions can live in $CLAUDE_CONFIG_DIR/CLAUDE.local.md
// and will be appended after the global memory.

function applyClaude(acc, memory) {
    const configDir = acc.config;
    mkdirSync(configDir, { recursive: true });

    const localFile = join(configDir, 'CLAUDE.local.md');
    const local = existsSync(localFile) ? '\n\n---\n\n' + readFileSync(localFile, 'utf8').trim() : '';

    const content = ORBIT_HEADER + memory + local + '\n';
    writeFileSync(join(configDir, 'CLAUDE.md'), content, 'utf8');
}

// ── Codex ─────────────────────────────────────────────────────────────────────
// Writes to ~/.codex/instructions.md
// Codex reads this file as global instructions when present.

function applyCodex(memory) {
    const codexDir = join(os.homedir(), '.codex');
    mkdirSync(codexDir, { recursive: true });

    const content = ORBIT_HEADER + memory + '\n';
    writeFileSync(join(codexDir, 'instructions.md'), content, 'utf8');
}
