#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" --experimental-modules --no-warnings "$0" "$@"

import inquirer from 'inquirer';
import by from 'sort-by';
import R from 'ramda';
import { read, exec, error } from './taskfile';

/**
 * @method list
 * @return {String}
 */
const list = () => {

    const choices  = R.uniq(read().filter(task => task.hide !== true).sort(by('name')).map(task => task.name));
    const question = {
        type: 'list',
        name: 'script',
        message: 'Which task would you like to run?',
        choices,
        filter: value => value.toLowerCase()
    };

    choices.length > 0 ? inquirer.prompt([question]).then(answers => {
        const task = read().find(model => model.name === answers.script);
        answers.script && exec(task.tasks);
    }) : error('Unable to find any commands to enumerate.');

};

/**
 * @method main
 * @return {void}
 */
const main = () => {

    const [,, name = null] = process.argv;
    const task = read().find(model => model.name === name);

    // When a name has been specified we'll run the associated task, otherwise list all of the available tasks.
    name ? (task ? exec(task.tasks) : error(`Unable to find the "${name}" task.`)) : list();

};

main();
