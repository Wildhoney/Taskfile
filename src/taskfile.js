import { readFileSync } from 'fs';
import { compose } from 'ramda';
import { platform } from 'os';
import yaml from 'js-yaml';

const newLines = /\r?\n|\r/g;
const multipleSpaces = /\s\s+/g;

const strip = compose(
    str => str.replace(newLines, ''),
    str => str.replace(multipleSpaces, ' ')
);

/**
 * @method parse
 * @param {Array} tasks
 * @param {Array} [isWindows]
 * @return {String}
 */
const parse = (tasks, isWindows) => {

    const separator = isWindows ? '&&' : '&';

    return tasks.reduce((xs, task, index) => {

        const isLast = index === (tasks.length - 1);

        return strip(`
            ${xs}
            ${task}
            ${isLast ? '' : separator}
        `.trim());

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
