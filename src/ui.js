import chalk from 'chalk';
import { VERSION } from './config.js';
import { detect, PROVIDERS } from './providers.js';
import { readAccounts, readOllamaModels, getEnabledProviders } from './config.js';

export const c = {
    success: (s) => chalk.green(s),
    error:   (s) => chalk.red(s),
    info:    (s) => chalk.cyan(s),
    warn:    (s) => chalk.yellow(s),
    dim:     (s) => chalk.dim(s),
    bold:    (s) => chalk.bold(s),
    header:  (s) => chalk.cyan.bold(s),
};

export function divider() {
    console.log(chalk.bold('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
}

export function showWelcome() {
    const bins     = detect();
    const enabled  = getEnabledProviders();
    const accounts = readAccounts();
    const models   = readOllamaModels();

    console.log();
    console.log(chalk.cyan.bold('   ██████  ██████  ██████  ██ ████████'));
    console.log(chalk.cyan.bold('  ██    ██ ██   ██ ██   ██ ██    ██   '));
    console.log(chalk.cyan.bold('  ██    ██ ██████  ██████  ██    ██   '));
    console.log(chalk.cyan.bold('  ██    ██ ██   ██ ██   ██ ██    ██   '));
    console.log(chalk.cyan.bold('   ██████  ██   ██ ██████  ██    ██   '));
    console.log();
    console.log(`  ${chalk.bold('AI Code Switch')}  ${chalk.dim('v' + VERSION)}`);
    console.log(`  ${chalk.dim('Your universal AI coding assistant launcher')}`);
    console.log();
    divider();
    console.log();

    console.log(`  ${chalk.bold('Providers:')}`);
    for (const id of enabled) {
        const p = PROVIDERS[id];
        if (!p) continue;
        const installed = !!bins[id];
        const icon      = installed ? chalk.green('✓') : chalk.red('✗');
        let   extra     = '';
        if (id === 'claude' && installed) {
            extra = chalk.dim(` (${accounts.length} account${accounts.length !== 1 ? 's' : ''})`);
        }
        if (id === 'ollama' && installed) {
            extra = chalk.dim(` (${models.length} model${models.length !== 1 ? 's' : ''})`);
        }
        if (!installed) {
            extra = chalk.dim(' — not installed');
        }
        console.log(`    ${icon} ${chalk.bold(p.label.padEnd(14))} ${chalk.dim(p.tagline)}${extra}`);
    }

    console.log();
    divider();
    console.log();
    console.log(`  ${chalk.bold('Commands:')}`);

    const cmd = 'orbit';
    const rows = [
        [cmd,                   'Launch the assistant selector'],
        [`${cmd} --add`,        'Add a Claude Code account'],
        [`${cmd} --remove`,     'Remove a Claude Code account'],
        [`${cmd} --add-model`,  'Add an Ollama model'],
        [`${cmd} --setup`,      'Re-run the setup wizard'],
        [`${cmd} --list`,       'List all accounts & models'],
        [`${cmd} --version`,    'Version & provider status'],
        [`${cmd} --help`,       'Show this screen'],
    ];
    for (const [c1, c2] of rows) {
        console.log(`    ${chalk.cyan(c1.padEnd(22))} ${chalk.dim(c2)}`);
    }
    console.log();
    console.log(`  ${chalk.dim('Run')} ${chalk.cyan(cmd)} ${chalk.dim('to get started.')}`);
    console.log();
}

export function showVersion() {
    const bins = detect();
    console.log();
    console.log(`  ${chalk.bold('orbit — AI Code Switch')} ${chalk.dim('v' + VERSION)}`);
    console.log();
    console.log(`  ${chalk.bold('Providers detected:')}`);
    for (const [id, p] of Object.entries(PROVIDERS)) {
        const bin  = bins[id];
        const icon = bin ? chalk.green('✓') : chalk.red('✗');
        const loc  = bin ? chalk.dim(`(${bin})`) : chalk.dim('not found');
        console.log(`    ${icon} ${p.label.padEnd(14)} ${loc}`);
    }
    console.log();
}
