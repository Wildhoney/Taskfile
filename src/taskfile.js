import { readFileSync } from 'fs';
import { compose, not } from 'ramda';
import { platform } from 'os';
import { existsSync } from 'fs';
import yaml from 'js-yaml';

/**
 * @constant TASKFILE_RC
 * @type {String}
 */
const TASKFILE_RC = '.taskfile.yml';

/**
 * @constant MAX_ITERATIONS
 * @type {Number}
 */
const MAX_ITERATIONS = 10;

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
 * @constant isWin32
 * @type {Boolean}
 */
export const isWin32 = platform() === 'win32';

/**
 * @method strip
 * @param * {String}
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
 * @param {Boolean} [isWindows]
 * @return {String}
 */
const parse = (tasks, isWindows) => {

    return tasks.reduce((xs, task, index) => {

        const isFirst         = index === 0;
        const isLast          = index === (tasks.length - 1);
        const isPreviousArray = Array.isArray(tasks[index - 1]);
        const isNextArray     = Array.isArray(tasks[index + 1]);
        const isSingle        = tasks.filter(task => not(Array.isArray(task))).length === 1;

        const inaugurator = isWindows || isSingle ? '' : '(';
        const separator   = isWindows || isSingle ? '&&' : (isNextArray ? '' : '&');
        const terminator  = isWindows || isSingle ? '' : '& wait)';

        if (Array.isArray(task) && !isSingle) {

            return strip(`
                ${xs}
                ${(isSingle || !isWindows) && (!isFirst && !isPreviousArray) ? '&&' : ''}
                ${parse(task, isWindows)}
                ${isLast ? '' : '&&'}
            `);

        }

        return strip(`
            ${xs}
            ${isFirst ? inaugurator : ''}
            ${isPreviousArray ? inaugurator : ''}
            ${task}
            ${isNextArray ? terminator : ''}
            ${isLast ? terminator : separator}
        `);

    }, '');

};

/**
 * @method seek
 * @param {String} [file = TASKFILE_RC]
 * @return {Object}
 */
export const seek = (file = TASKFILE_RC) => {

    /**
     * @method locate
     * @param {String} [path = './]]
     * @param {Number} [iteration = 0]
     * @return {Object}
     */
    const locate = (path = './', iteration = 0) => {

        return iteration > MAX_ITERATIONS ? { found: false } : (location => {

            // Determine if the taskfile exists in the current path, otherwise keep iterating until we meet
            // the limit as determined by `MAX_ITERATIONS`.
            return existsSync(location) ? { location, path, found: true } : locate(`${path}../`, iteration + 1);

        })(`${path}${file}`);

    };

    return locate();

};

/**
 * @method env
 * @param {String} environment
 * @return {Function}
 */
const env = environment => {
    return model => environment === (model.env || '');
};

/**
 * @method read
 * @param {String} [file = TASKFILE_RC]
 * @param {String} [environment = '']
 * @param {Boolean} [isWindows = isWin32]
 * @return {String}
 */
export const read = (file = TASKFILE_RC, environment = process.env.NODE_ENV, isWindows = isWin32) => {

    const { found, location } = seek(file);

    return found ? yaml.safeLoad(readFileSync(location)).filter(env(environment)).map(model => {

        // Attempt to read the file as YAML.
        const tasks = (model.task || (model.tasks && Array.isArray(model.tasks))) ? (model.task ? [model.task] : model.tasks) : [];
        return { ...model, tasks: parse(tasks, isWindows) };

    }) : (() => { throw new Error(`Unable to find ${file} relative to the current directory.`); })();

};
