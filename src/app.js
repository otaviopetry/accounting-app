import { save } from './repository.js';
import Expense from './expense.js';
import TerminalController from './terminalController.js';
import database from './../database.json';

const OPTIONS = {
    questions: {
        'category': 'Qual foi a categoria da despesa?',
        'value': 'Qual foi o valor da despesa?',
        'date': 'Qual foi a data da despesa?',
        'note': 'Adicione os itens da despesa (separados por vírgula):',
    },
    stopCommand: ':q',
    defaultLanguage: 'pt-BR',
}

export default class App {
    constructor() {
        this.answeredQuestions = { };
        this.terminalController = new TerminalController();
        this.terminalController.initializeTerminal(
            database,
            OPTIONS.defaultLanguage,
        );
    }
    
    mainLoop = async (currentQuestionIndex = 0) => {
        if (currentQuestionIndex === Object.keys(OPTIONS.questions).length) {
            await this.handleCompleteEntry();
        }
    
        try {
            await this.handleIteration(currentQuestionIndex);
        } catch (error) {
            await this.handleError(error);
        }
    }
    
    handleCompleteEntry = async () => {
        const expense = Expense.generateInstanceFromObject(this.answeredQuestions);

        await save(expense);
        this.terminalController.updateTable(expense.formatted(OPTIONS.defaultLanguage));
        this.terminalController.print('Entry has been saved. Press add another one or type :q to quit')
    
        return this.mainLoop();
    }
    
    handleIteration = async (currentQuestionIndex) => {
        const currentQuestionFieldName = Object.keys(OPTIONS.questions)[currentQuestionIndex];
        const answer = await this.terminalController.question(OPTIONS.questions[currentQuestionFieldName] + ' ');
    
        if (answer === OPTIONS.stopCommand) {
            terminalController.closeTerminal();
            console.log('Process finished! Press Ctrl + C to exit the application.');
    
            return;
        }
    
        this.answeredQuestions[currentQuestionFieldName] = answer;
    
        return this.mainLoop(currentQuestionIndex + 1);
    }
    
    handleError = async (error) => {
        console.log('Error: ', error);
    
        return this.mainLoop();
    }    
}