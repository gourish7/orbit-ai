import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, lstatSync, symlinkSync } from 'fs';
import { join } from 'path';
import os from 'os';

export const VERSION = '1.1.0';
export const DATA_DIR = join(os.homedir(), '.orbit');
export const ACCOUNTS_FILE = join(DATA_DIR, 'accounts.json');
export const OLLAMA_MODELS_FILE = join(DATA_DIR, 'ollama-models.json');
export const CONFIG_FILE = join(DATA_DIR, 'config.json');
export const SHARED_PROJECTS_DIR = join(DATA_DIR, 'projects');
export const MEMORY_FILE = join(DATA_DIR, 'memory.md');

export function init() {
    mkdirSync(DATA_DIR, { recursive: true });

    if (!existsSync(SHARED_PROJECTS_DIR) && !isSymlink(SHARED_PROJECTS_DIR)) {
        mkdirSync(SHARED_PROJECTS_DIR, { recursive: true });
    }
    if (!existsSync(ACCOUNTS_FILE)) {
        writeFileSync(ACCOUNTS_FILE, JSON.stringify({ accounts: [] }, null, 2));
    }
    if (!existsSync(OLLAMA_MODELS_FILE)) {
        writeFileSync(OLLAMA_MODELS_FILE, JSON.stringify({ models: ['qwen2.5-coder:7b'] }, null, 2));
    }
}

function isSymlink(p) {
    try { return lstatSync(p).isSymbolicLink(); } catch { return false; }
}

export function readConfig()          { return existsSync(CONFIG_FILE) ? JSON.parse(readFileSync(CONFIG_FILE, 'utf8')) : {}; }
export function writeConfig(cfg)      { writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2)); }
export function isSetupComplete()     { return readConfig().setup_complete === true; }
export function getEnabledProviders() { return readConfig().enabled_providers || []; }

export function readAccounts() {
    if (!existsSync(ACCOUNTS_FILE)) return [];
    return JSON.parse(readFileSync(ACCOUNTS_FILE, 'utf8')).accounts || [];
}
export function writeAccounts(accounts) {
    writeFileSync(ACCOUNTS_FILE, JSON.stringify({ accounts }, null, 2));
}

export function readMemory() {
    if (!existsSync(MEMORY_FILE)) return null;
    const content = readFileSync(MEMORY_FILE, 'utf8').trim();
    return content || null;
}
export function writeMemory(content) {
    writeFileSync(MEMORY_FILE, content, 'utf8');
}

export function readOllamaModels() {
    if (!existsSync(OLLAMA_MODELS_FILE)) return [];
    return JSON.parse(readFileSync(OLLAMA_MODELS_FILE, 'utf8')).models || [];
}
export function writeOllamaModels(models) {
    writeFileSync(OLLAMA_MODELS_FILE, JSON.stringify({ models }, null, 2));
}

export function ensureSharedProjects(configDir) {
    mkdirSync(configDir, { recursive: true });
    const link = join(configDir, 'projects');
    try {
        const stat = lstatSync(link);
        if (!stat.isSymbolicLink()) {
            rmSync(link, { recursive: true, force: true });
            trySymlink(link);
        }
    } catch {
        trySymlink(link);
    }
}

function trySymlink(link) {
    try {
        symlinkSync(SHARED_PROJECTS_DIR, link);
    } catch {
        // Windows without elevated perms — skip silently, basic usage still works
    }
}
