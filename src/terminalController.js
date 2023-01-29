'use strict';

import chalk from 'chalk';
import chalkTable from 'chalk-table';
import readline from 'readline';
import DraftLog from 'draftlog';
import Expense from './expense.js';

export default class TerminalController {
    constructor() {
        this.print = {};
        this.data = {};
        this.terminal = {};
    }

    initializeTerminal(database, language) {
        DraftLog(console).addLineListener(process.stdin);
        this.terminal = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        this.initializeTable(database, language);
    }

    closeTerminal() {
        this.terminal.close();
    }

    initializeTable(database, language) {
        const data = database.map(
            item => new Expense(item).formatted(language),
        );
        const table = chalkTable(this.getTableOptions(), data);

        this.print = console.draft(table);
        this.data = data;
    }

    updateTable(entry) {
        this.data.push(entry);
        this.print(chalkTable(this.getTableOptions(), this.data));
    }

    question(message = '') {
        return new Promise(resolve => this.terminal.question(
            message,
            resolve,
        ));
    }

    getTableOptions() {
        return {
            leftPad: 2,
            columns: [
                { field: 'category', name: chalk.cyan('Category') },
                { field: 'value', name: chalk.magenta('Value') },
                { field: 'date', name: chalk.green('Date') },
                { field: 'note', name: chalk.red('Description') },            ]
        };
    }
}