import { prompt } from 'inquirer';
import { exec } from 'child_process';
import PrettyError from 'pretty-error';
import by from 'sort-by';
import { run } from './cli';
import { read } from './taskfile';

/**
 * @method list
 * @return {String}
 */
export const list = () => {

    const choices = read().filter(task => task.hide !== true).sort(by('name')).map(task => task.name);

    const questions = [
        {
            type: 'list',
            name: 'script',
            message: 'Which task would you like to run?',
            choices,
            filter: value => value.toLowerCase()
        }
    ];

    choices.length > 0 ? prompt(questions).then(answers => answers.script && run(`taskfile ${answers.script}`)) : (() => {

        // Render error that we're unable to find any help choices.
        const pe = new PrettyError();
        const renderedError = pe.render(new Error('Unable to find any commands to enumerate.'));
        console.log(renderedError);
        process.exit(1);

    })();

};