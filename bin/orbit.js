#!/usr/bin/env node
import { init, isSetupComplete, readOllamaModels, writeOllamaModels, readMemory, writeMemory, MEMORY_FILE } from '../src/config.js';
import { setupWizard } from '../src/wizard.js';
import { selectAndLaunch } from '../src/selector.js';
import { addAccount, removeAccount, listAccounts } from '../src/accounts.js';
import { showWelcome, showVersion, divider } from '../src/ui.js';
import { detect } from '../src/providers.js';
import chalk from 'chalk';
import inquirer from 'inquirer';

init();

const [flag, ...rest] = process.argv.slice(2);

switch (flag) {

    case '--setup':
        await setupWizard();
        break;

    case '--add':
        await addAccount();
        break;

    case '--remove':
        await removeAccount();
        break;

    case '--add-model': {
        const { model } = await inquirer.prompt([{
            type:     'input',
            name:     'model',
            message:  'Model name (e.g. qwen2.5-coder:7b):',
            validate: (v) => v.trim() ? true : 'Model name cannot be empty.',
        }]);
        const models = readOllamaModels();
        if (models.includes(model.trim())) {
            console.log(chalk.yellow(`  Already in list: ${model.trim()}`));
        } else {
            models.push(model.trim());
            writeOllamaModels(models);
            console.log(chalk.green(`  ✓ Added: ${model.trim()}\n`));
        }
        break;
    }

    case '--list': {
        const bins = detect();
        console.log();
        console.log(chalk.green.bold('  Claude Accounts:'));
        listAccounts();
        if (bins.codex) {
            console.log();
            console.log(chalk.cyan.bold('  OpenAI Codex:') + chalk.green(' installed ✓'));
        }
        if (bins.ollama) {
            console.log();
            console.log(chalk.yellow.bold('  Ollama Models:'));
            readOllamaModels().forEach((m) => console.log(`    - ${m}`));
        }
        console.log();
        break;
    }

    case '--memory': {
        const sub = rest[0];

        if (sub === '--show') {
            const mem = readMemory();
            if (!mem) {
                console.log(chalk.dim('\n  No memory set yet. Run: orbit --memory\n'));
            } else {
                console.log();
                console.log(chalk.cyan.bold('  ~/.orbit/memory.md'));
                divider();
                console.log();
                console.log(mem);
                console.log();
            }
        } else {
            // Open in $EDITOR (fallback: nano, then vi)
            const editor = process.env.EDITOR || process.env.VISUAL || 'nano';
            // Seed file with template if it doesn't exist
            if (!readMemory()) {
                writeMemory([
                    '# Orbit Memory',
                    '',
                    'Rules and context applied to all AI assistants on every launch.',
                    '',
                    '## Engineering Workflow',
                    '',
                    '- For features: present a plan first, wait for approval, then code.',
                    '- For bugs: identify root cause, list repercussions, get approval, then fix.',
                ].join('\n'));
            }
            const { spawnSync } = await import('child_process');
            const result = spawnSync(editor, [MEMORY_FILE], { stdio: 'inherit' });
            if (result.error) {
                console.log(chalk.red(`\n  Could not open editor (${editor}). Edit manually: ${MEMORY_FILE}\n`));
            } else {
                console.log(chalk.green(`\n  ✓ Memory saved — will be applied on next launch.\n`));
            }
        }
        break;
    }

    case '--version':
    case '-v':
        showVersion();
        break;

    case '--help':
    case '-h':
        showWelcome();
        break;

    default: {
        // Pass any unknown flags straight through to the selected provider
        const passthroughArgs = flag ? [flag, ...rest] : [];
        if (!isSetupComplete()) {
            await setupWizard();
        } else {
            await selectAndLaunch(passthroughArgs);
        }
        break;
    }
}
