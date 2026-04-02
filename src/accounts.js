import { join } from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { readAccounts, writeAccounts, DATA_DIR, ensureSharedProjects } from './config.js';

export function listAccounts() {
    const accounts = readAccounts();
    if (!accounts.length) {
        console.log(chalk.dim('  No accounts configured.'));
        return;
    }
    accounts.forEach((acc, i) => {
        const project = acc.project ? chalk.dim(`  → ${acc.project}`) : '';
        console.log(`  ${chalk.bold(i + 1 + ')')} ${acc.name} ${chalk.dim('(' + acc.email + ')')}${project}`);
    });
}

export async function addAccount() {
    const answers = await inquirer.prompt([
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

    const accounts = readAccounts();
    if (accounts.find((a) => a.name === answers.name.trim())) {
        console.log(chalk.yellow(`  Account '${answers.name.trim()}' already exists.`));
        return;
    }

    const configDir = join(DATA_DIR, 'accounts', answers.name.trim());
    ensureSharedProjects(configDir);

    accounts.push({
        name:    answers.name.trim(),
        email:   answers.email.trim(),
        config:  configDir,
        project: answers.project.trim(),
    });
    writeAccounts(accounts);

    console.log(chalk.green(`\n  ✓ Account added: ${answers.name.trim()}`));
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
            ...accounts.map((a, i) => ({ name: `${a.name} (${a.email})`, value: i })),
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
