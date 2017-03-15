import { readFileSync } from 'fs';
import { compose, not } from 'ramda';
import { platform } from 'os';
import yaml from 'js-yaml';

/**
 * @constant newLines
 * @type {RegExp}
 */
const newLines = /\r?\n|\r/g;

/**
 * @constant multipleSpaces
 * @type {RegExp}
 */
const multipleSpaces = /\s\s+/g;

/**
 * @constant groupOpen
 * @type {RegExp}
 */
const groupOpen = /\(\s+/g;

/**
 * @method strip
 * @return {String}
 */
const strip = compose(
    str => str.trim(),
    str => str.replace(newLines, ''),
    str => str.replace(multipleSpaces, ' '),
    str => str.replace(groupOpen, '(')
);

/**
 * @method parse
 * @param {Array} tasks
 * @param {Array} [isWindows]
 * @return {String}
 */
const parse = (tasks, isWindows) => {

    return tasks.reduce((xs, task, index) => {

        const isFirst  = index === 0 || Array.isArray(tasks[index - 1]);
        const isLast   = index === (tasks.length - 1);
        const isSingle = tasks.filter(task => not(Array.isArray(task))).length === 1;

        const inaugurator = isWindows || isSingle ? '' : '(';
        const separator   = isWindows || isSingle ? '&&' : '&';
        const terminator  = isWindows || isSingle ? '' : '& wait)';

        return strip(`
            ${isFirst ? inaugurator : ''}
            ${xs}
            ${task}
            ${isLast ? terminator : separator}
        `);

    }, '');

};

/**
 * @method read
 * @param {String} file
 * @param {Boolean} [isWindows]
 * @return {String}
 */
export const read = (file, isWindows = platform() === 'win32') => {

    return yaml.safeLoad(readFileSync(file)).map(model => {
        return { ...model, tasks: Array.isArray(model.tasks) ? parse(model.tasks, isWindows) : [] };
    });

};
