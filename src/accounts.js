import { mkdirSync } from 'fs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { readAccounts, writeAccounts, accountDir, ensureSharedProjects, enableProvider } from './config.js';

const PROVIDER_LABELS = { claude: 'Claude Code', codex: 'OpenAI Codex' };

export function listAccounts(provider) {
    const accounts = readAccounts().filter((a) => a.provider === provider);
    if (!accounts.length) {
        console.log(chalk.dim('  No accounts configured.'));
        return;
    }
    accounts.forEach((acc, i) => {
        const project = acc.project ? chalk.dim(`  → ${acc.project}`) : '';
        console.log(`  ${chalk.bold(i + 1 + ')')} ${acc.name} ${chalk.dim('(' + acc.email + ')')}${project}`);
    });
}

export async function addAccount(provider) {
    const answers = await inquirer.prompt([
        {
            type:    'list',
            name:    'provider',
            message: 'Which assistant is this account for?',
            when:    () => !provider,
            choices: [
                { name: 'Claude Code',   value: 'claude' },
                { name: 'OpenAI Codex',  value: 'codex'  },
            ],
        },
        {
            type:     'input',
            name:     'name',
            message:  'Account name (e.g. work, personal):',
            validate: (v) => v.trim() ? true : 'Name cannot be empty.',
        },
        {
            type:     'input',
            name:     'email',
            message:  'Email:',
            validate: (v) => v.trim() ? true : 'Email cannot be empty.',
        },
        {
            type:    'input',
            name:    'project',
            message: 'Default project path (optional, Enter to skip):',
        },
    ]);

    const type = provider || answers.provider;
    const name = answers.name.trim();

    const accounts = readAccounts();
    if (accounts.find((a) => a.provider === type && a.name === name)) {
        console.log(chalk.yellow(`  Account '${name}' already exists.`));
        return;
    }

    const configDir = accountDir(type, name);
    if (type === 'claude') {
        ensureSharedProjects(configDir);
    } else {
        mkdirSync(configDir, { recursive: true });
    }

    accounts.push({
        provider: type,
        name,
        email:    answers.email.trim(),
        config:   configDir,
        project:  answers.project.trim(),
    });
    writeAccounts(accounts);
    enableProvider(type);

    console.log(chalk.green(`\n  ✓ Account added: ${name}`));
    console.log(chalk.dim(`  Run orbit and select it to log in.\n`));
}

export async function removeAccount() {
    const accounts = readAccounts();
    if (!accounts.length) {
        console.log(chalk.yellow('  No accounts configured.'));
        return;
    }

    const { choice } = await inquirer.prompt([{
        type:    'list',
        name:    'choice',
        message: 'Select account to remove:',
        choices: [
            ...accounts.map((a, i) => ({ name: `${PROVIDER_LABELS[a.provider]} — ${a.name} (${a.email})`, value: i })),
            { name: chalk.dim('Cancel'), value: -1 },
        ],
    }]);

    if (choice === -1) return;

    const { confirm } = await inquirer.prompt([{
        type:    'confirm',
        name:    'confirm',
        message: `Remove ${accounts[choice].name}?`,
        default: false,
    }]);

    if (!confirm) return;

    const removed = accounts.splice(choice, 1)[0];
    writeAccounts(accounts);
    console.log(chalk.green(`\n  ✓ Removed: ${removed.name}\n`));
}
