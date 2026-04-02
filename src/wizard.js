import inquirer from 'inquirer';
import chalk from 'chalk';
import { spawnSync } from 'child_process';
import { detect, PROVIDERS, install } from './providers.js';
import { writeConfig, VERSION, readOllamaModels } from './config.js';
import { addAccount } from './accounts.js';
import { showWelcome, divider } from './ui.js';

const IS_WINDOWS = process.platform === 'win32';

export async function setupWizard() {
    console.clear();
    console.log();
    console.log(chalk.cyan.bold('  Welcome to orbit — AI Code Switch'));
    console.log(chalk.dim("  Let's get you set up. This takes about a minute."));
    console.log();
    divider();
    console.log();

    // ── Step 1: Choose providers ─────────────────────────────────────────────

    console.log(chalk.bold('  Step 1 of 3 — Choose your AI coding tools'));
    console.log();

    const { selected } = await inquirer.prompt([{
        type:    'checkbox',
        name:    'selected',
        message: 'Which AI coding tools do you want to use?',
        prefix:  ' ',
        choices: Object.values(PROVIDERS).map((p) => ({
            name:    `${chalk.bold(p.label.padEnd(16))} ${chalk.dim(p.tagline)}`,
            value:   p.id,
            checked: p.id === 'claude' || p.id === 'ollama',
        })),
        validate: (v) => v.length > 0 || 'Select at least one provider.',
    }]);

    console.log();

    // ── Step 2: Check & install ───────────────────────────────────────────────

    console.log(chalk.bold('  Step 2 of 3 — Checking installations'));
    console.log();

    const bins = detect();

    for (const id of selected) {
        const p = PROVIDERS[id];
        if (bins[id]) {
            console.log(`  ${chalk.green('✓')} ${chalk.bold(p.label)} — installed`);
        } else {
            console.log(`  ${chalk.yellow('⚠')} ${chalk.bold(p.label)} — not installed`);
            console.log(`    Install command: ${chalk.dim(p.installCmd())}`);
            console.log();

            const { doInstall } = await inquirer.prompt([{
                type:    'confirm',
                name:    'doInstall',
                message: `Install ${p.label} now?`,
                prefix:  '   ',
                default: true,
            }]);

            if (doInstall) {
                const cmd   = p.installCmd();
                const parts = cmd.split(' ');
                console.log();
                const result = spawnSync(parts[0], parts.slice(1), {
                    stdio: 'inherit',
                    shell: IS_WINDOWS,
                });
                if (result.status === 0) {
                    console.log(chalk.green(`\n  ✓ ${p.label} installed successfully`));
                } else {
                    console.log(chalk.yellow(`\n  ⚠ Installation may have failed — verify manually and re-run orbit --setup`));
                }
            } else {
                console.log(chalk.dim(`  Skipped — install it later and re-run orbit --setup`));
            }
            console.log();
        }
    }

    console.log();

    // ── Step 3: Configure ─────────────────────────────────────────────────────

    console.log(chalk.bold('  Step 3 of 3 — Configure'));
    console.log();

    const freshBins = detect();

    for (const id of selected) {
        if (!freshBins[id]) continue;

        if (id === 'claude') {
            const { doAdd } = await inquirer.prompt([{
                type:    'confirm',
                name:    'doAdd',
                message: 'Add your first Claude Code account now?',
                prefix:  '  ',
                default: true,
            }]);
            if (doAdd) await addAccount();
        }

        if (id === 'codex') {
            if (!process.env.OPENAI_API_KEY) {
                console.log(chalk.yellow('  OpenAI Codex — OPENAI_API_KEY not found in environment.'));
                console.log(chalk.dim('  Add this to your shell profile (~/.bashrc, ~/.zshrc):'));
                console.log(chalk.dim('  export OPENAI_API_KEY=your_key_here'));
                console.log();
            } else {
                console.log(chalk.green('  ✓ OpenAI Codex — OPENAI_API_KEY is set'));
                console.log();
            }
        }

        if (id === 'ollama') {
            const models = readOllamaModels();
            if (models.length) {
                console.log(chalk.green(`  ✓ Ollama — ${models.length} model${models.length !== 1 ? 's' : ''} available`));
            } else {
                console.log(chalk.dim('  Ollama — no models pulled yet.'));
                console.log(chalk.dim('  Example: ollama pull qwen2.5-coder:7b'));
            }
            console.log();
        }
    }

    // ── Save config ───────────────────────────────────────────────────────────

    writeConfig({ setup_complete: true, enabled_providers: selected, version: VERSION });

    divider();
    console.log();
    console.log(chalk.green.bold('  Setup complete!'));
    console.log();
    showWelcome();
}
