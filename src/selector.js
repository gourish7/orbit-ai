import { existsSync } from 'fs';
import { spawn } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { detect } from './providers.js';
import { getEnabledProviders, readAccounts, readOllamaModels, ensureSharedProjects } from './config.js';
import { divider } from './ui.js';

const IS_WINDOWS = process.platform === 'win32';

function launch(bin, args = [], env = {}) {
    const child = spawn(bin, args, {
        stdio:  'inherit',
        shell:  IS_WINDOWS,
        env:    { ...process.env, ...env },
    });
    child.on('close',  (code) => process.exit(code ?? 0));
    child.on('error',  (err)  => { console.error(chalk.red(`\n  Failed to launch: ${err.message}`)); process.exit(1); });
}

export async function selectAndLaunch(passthroughArgs = []) {
    const enabled  = getEnabledProviders();
    const bins     = detect();
    const accounts = readAccounts();

    // Build menu choices
    const choices = [];

    for (const id of enabled) {
        if (id === 'claude' && bins.claude && accounts.length) {
            if (choices.length) choices.push(new inquirer.Separator());
            choices.push(new inquirer.Separator(chalk.green.bold('  Claude Code')));
            accounts.forEach((acc, i) => {
                const project = acc.project ? chalk.dim(`  ${acc.project}`) : '';
                choices.push({
                    name:  `  ${acc.name} ${chalk.dim('(' + acc.email + ')')}${project}`,
                    value: { type: 'claude', index: i },
                });
            });
        }

        if (id === 'codex' && bins.codex) {
            if (choices.length) choices.push(new inquirer.Separator());
            choices.push(new inquirer.Separator(chalk.cyan.bold('  OpenAI Codex')));
            choices.push({
                name:  `  codex ${chalk.dim('(uses $OPENAI_API_KEY)')}`,
                value: { type: 'codex' },
            });
        }

        if (id === 'ollama' && bins.ollama) {
            const models = readOllamaModels();
            if (models.length) {
                if (choices.length) choices.push(new inquirer.Separator());
                choices.push(new inquirer.Separator(chalk.yellow.bold('  Ollama (Local)')));
                models.forEach((model) => {
                    choices.push({ name: `  ${model}`, value: { type: 'ollama', model } });
                });
            }
        }
    }

    if (!choices.filter((c) => !c.type?.includes?.('separator') && c.value).length) {
        console.log(chalk.red('\n  No providers available. Run: orbit --setup\n'));
        process.exit(1);
    }

    console.log();
    console.log(`  ${chalk.cyan.bold('orbit')}  ${chalk.dim('AI Code Switch')}`);
    divider();
    console.log();

    const { selection } = await inquirer.prompt([{
        type:    'list',
        name:    'selection',
        message: 'Select assistant:',
        prefix:  ' ',
        choices,
        pageSize: 15,
    }]);

    console.log();

    // ── Dispatch ──────────────────────────────────────────────────────────────

    if (selection.type === 'claude') {
        const acc = accounts[selection.index];
        ensureSharedProjects(acc.config);

        if (!existsSync(`${acc.config}/.credentials.json`)) {
            console.log(chalk.yellow(`  First time — logging in as: ${acc.name}\n`));
            const loginResult = spawn(bins.claude, ['login'], {
                stdio: 'inherit',
                shell: IS_WINDOWS,
                env:   { ...process.env, CLAUDE_CONFIG_DIR: acc.config },
            });
            await new Promise((resolve, reject) => {
                loginResult.on('close', (code) => code === 0 ? resolve() : reject(new Error('Login failed')));
            });
        }

        if (acc.project && existsSync(acc.project)) {
            process.chdir(acc.project);
        }

        console.log(chalk.green(`  ✓ Launching Claude Code as ${chalk.bold(acc.name)}\n`));
        launch(bins.claude, passthroughArgs, { CLAUDE_CONFIG_DIR: acc.config });
    }

    else if (selection.type === 'codex') {
        if (!process.env.OPENAI_API_KEY) {
            console.log(chalk.red('  OPENAI_API_KEY is not set. Add it to your shell profile.\n'));
            process.exit(1);
        }
        console.log(chalk.green('  ✓ Launching OpenAI Codex\n'));
        launch(bins.codex, passthroughArgs);
    }

    else if (selection.type === 'ollama') {
        if (!bins.claude) {
            console.log(chalk.red('  Claude Code is required as the Ollama frontend but is not installed.\n'));
            process.exit(1);
        }
        console.log(chalk.green(`  ✓ Launching Ollama: ${chalk.bold(selection.model)}\n`));
        launch(bins.claude, ['--model', selection.model, ...passthroughArgs], {
            ANTHROPIC_AUTH_TOKEN: 'ollama',
            ANTHROPIC_BASE_URL:   'http://localhost:11434',
            ANTHROPIC_API_KEY:    'ollama',
        });
    }
}
