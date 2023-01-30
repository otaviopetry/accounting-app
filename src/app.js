import { save } from './repository.js';
import Expense from './expense.js';
import TerminalController from './terminalController.js';
import database from './../database.json';

const OPTIONS = {
    questions: {
        'category': {
            message: 'Qual a categoria da despesa?',
            isValid: (category) => {
                return category.length > 0;
            },
            errorMessage: 'Por favor, insira uma categoria válida',
        },
        'value': {
            message: 'Qual foi o valor da despesa?',
            isValid: (value) => {
                return value.length > 0;
            },
            errorMessage: 'Por favor, insira um valor válido (ex: 100.00)',
        },
        'date': {
            message: 'Qual a data da despesa?',
            isValid: (date) => {
                return date.split('-').length === 3 || date === '';
            },
            errorMessage: 'Por favor, insira uma data válida no formato 2000-01-01)',
        },
        'note': {
            message: 'Descreva a despesa',
            isValid: (note) => {
                return note.length > 0;
            },
            errorMessage: 'Descreva a despesa com a ocasião ou itens comprados, exemplo: "Restaurante - Mantra", ou "pão, leite, café"',
        },
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
            await this.handleError(error, currentQuestionIndex);
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
        const currentQuestionFieldName = Object.keys(
            OPTIONS.questions,
        )[currentQuestionIndex];
        const currentQuestion = OPTIONS.questions[currentQuestionFieldName];
        const answer = await this.terminalController.question(
            currentQuestion.message + ' ',
        );        

        if (!currentQuestion.isValid(answer)) {
            throw new Error(currentQuestion.errorMessage);
        }
    
        if (answer === OPTIONS.stopCommand) {
            terminalController.closeTerminal();
            console.log('Process finished! Press Ctrl + C to exit the application.');
    
            return;
        }
    
        this.answeredQuestions[currentQuestionFieldName] = answer;
    
        return this.mainLoop(currentQuestionIndex + 1);
    }
    
    handleError = async (error, currentQuestionIndex) => {
        console.log('Error: ', error.message);
    
        return this.mainLoop(currentQuestionIndex);
    }    
}