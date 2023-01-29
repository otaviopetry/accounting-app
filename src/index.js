import Expense from './expense.js';
import TerminalController from './terminalController.js';
import { save } from './repository.js';
import database from './../database.json';

const DEFAULT_LANGUAGE = 'pt-BR';
const STOP_TERMINAL_COMMAND = ':q';

const terminalController = new TerminalController();
terminalController.initializeTerminal(database, DEFAULT_LANGUAGE);

const QUESTIONS = {
    'category': 'Qual foi a categoria da despesa?',
    'value': 'Qual foi o valor da despesa?',
    'date': 'Qual foi a data da despesa?',
    'note': 'Adicione os itens da despesa (separados por vírgula):',
};
const QUESTIONS_FIELD_NAMES = Object.keys(QUESTIONS);

const answeredQuestions = { }

async function mainLoop(currentQuestionIndex = 0) {
    if (currentQuestionIndex === QUESTIONS_FIELD_NAMES.length) {
        await handleCompleteEntry();
    }

    try {
        await handleIteration(currentQuestionIndex);
    } catch (error) {
        await handleError(error);
    }
}

async function handleCompleteEntry() {
    const expense = Expense.generateInstanceFromObject(answeredQuestions);
    await save(expense);
    terminalController.updateTable(expense.formatted(DEFAULT_LANGUAGE));
    terminalController.print('Entry has been saved. Press add another one or type :q to quit')

    return mainLoop();
}

async function handleIteration(currentQuestionIndex) {
    const currentQuestionFieldName = QUESTIONS_FIELD_NAMES[currentQuestionIndex];
    const answer = await terminalController.question(QUESTIONS[currentQuestionFieldName]);

    if (answer === STOP_TERMINAL_COMMAND) {
        terminalController.closeTerminal();
        console.log('Process finished! Press Ctrl + C to exit the application.');

        return;
    }

    answeredQuestions[currentQuestionFieldName] = answer;

    return mainLoop(currentQuestionIndex + 1);
}

async function handleError(error) {
    console.log('Error: ', error);

    return mainLoop();
}

await mainLoop();