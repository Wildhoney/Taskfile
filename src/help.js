import { prompt }     from 'inquirer';
import PrettyError    from 'pretty-error';
import by             from 'sort-by';
import { run }        from './cli';
import { read, exec } from './taskfile';

/**
 * @method list
 * @return {String}
 */
export const list = () => {

    const choices   = read().filter(task => task.hide !== true).sort(by('name')).map(task => task.name);
    const questions = [
        {
            type: 'list',
            name: 'script',
            message: 'Which task would you like to run?',
            choices,
            filter: value => value.toLowerCase()
        }
    ];

    choices.length > 0 ? prompt(questions).then(answers => {

        const task = read().find(model => model.name === answers.script);
        answers.script && exec(task.tasks);

    }) : do {

        // Render the error that we're unable to find any help choices.
        const error = new PrettyError();
        console.log(error.render(new Error('Unable to find any commands to enumerate.')));
        process.exit(1);

    };

};
