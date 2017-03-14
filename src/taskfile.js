import { readFileSync } from 'fs';
import { platform } from 'os';
import yaml from 'js-yaml';

const removeNewLines = /\r?\n|\r/g;
const removeMultipleSpaces = /\s\s+/g;

const isWindows = platform() === 'win32';

/**
 * @method parse
 * @param {Array} tasks
 * @return {String}
 */
const parse = tasks => {

    return tasks.reduce((accumulator, task, index) => {

        const isEmpty = accumulator === '';
        const isStart = index === 0;
        const isLast = tasks.length === (index + 1);
        const isCurrentArray = Array.isArray(task);
        const isNextArray = Array.isArray(tasks[index + 1]);
        const isPreviousArray = Array.isArray(tasks[index - 1]);
        const isStartOrPreviousIsArray = isPreviousArray || isStart;
        const isLastOrNextIsArray = isNextArray || isLast;
        const isSingleCommand = tasks.length === 1 || tasks.filter(task => !Array.isArray(task)).length === 1;
        const separator = isPreviousArray ? '&&' : (isWindows ? '&&' : '&');

        if (isCurrentArray) {

            return `
                ${accumulator}
                ${isEmpty ? '' : '&&'}
                ${parse(task)}
                ${isLastOrNextIsArray ? (isSingleCommand ? ')' : '& wait)') : ''}
            `.trim().replace(removeNewLines, '').replace(removeMultipleSpaces, ' ');

        }

        return `
            ${accumulator}
            ${isEmpty ? '' : separator}
            ${isStartOrPreviousIsArray ? '(' : ''}
            ${task}
            ${isLastOrNextIsArray ? (isSingleCommand ? ')' : '& wait)') : ''}
        `.trim().replace(removeNewLines, '').replace(removeMultipleSpaces, ' ');

    }, '');

};

/**
 * @method read
 * @param {String} file
 * @return {String}
 */
export const read = file => {

    return yaml.safeLoad(readFileSync(file)).map(model => {
        return { ...model, tasks: parse(model.tasks) };
    });

};
