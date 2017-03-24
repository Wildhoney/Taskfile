import { readFileSync } from 'fs';
import R from 'ramda';
import { platform } from 'os';
import { existsSync } from 'fs';
import { spawn } from 'child_process';
import yaml from 'js-yaml';
import execa from 'execa';

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
 * @method normalise
 * @param {Array} tasks
 * @return {Array}
 */
const normalise = tasks  => {

    return tasks.reduce((xs, task, index) => {

        const isFirst         = index === 0;
        const isLast          = index === (tasks.length - 1);
        const isPreviousArray = Array.isArray(tasks[index - 1]);
        const isNextArray     = Array.isArray(tasks[index + 1]);
        const isSingle        = tasks.filter(task => R.not(Array.isArray(task))).length === 1;

        if (Array.isArray(task) || isPreviousArray) {
            return [...xs, ...normalise(Array.isArray(task) ? task : [task])];
        }

        const [rest, last] = [R.init(xs), (R.last(xs) || [])];
        return [ ...rest, [...last, task] ];

    }, []);

};

/**
 * @method exec
 * @param {Array} tasks
 * @return {Promise}
 */
export const exec = tasks => {

    return new Promise(resolve => {

        // execa('npm', ['run', 'build'], { stdio: 'inherit' }).then(resolve);
        execa('prepend', [`bin/index.js`, `#!/usr/bin/env node\n\n`], { stdio: 'inherit' }).then(resolve);

    });

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
 * @method parse
 * @param {String} file
 * @return {Array}
 */
const parse = file => yaml.safeLoad(readFileSync(file));

/**
 * @method env
 * @param {String} environment
 * @return {Function}
 */
const env = environment => {
    return ({ env = '' }) => env === '' || environment === env;
};

/**
 * @method read
 * @param {String} [file = TASKFILE_RC]
 * @param {String} [environment = process.env.NODE_ENV]
 * @return {Array}
 */
export const read = (file = TASKFILE_RC, environment = process.env.NODE_ENV) => {

    const { found, location } = seek(file);

    return found ? parse(location).filter(env(environment)).map(model => {
        return R.omit(['task'], { ...model, tasks: normalise(model.task ? [model.task] : (model.tasks || [])) });
    }) : (() => { throw new Error(`Unable to find ${file} relative to the current directory.`); })();

};
