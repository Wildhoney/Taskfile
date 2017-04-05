import fs          from 'fs';
import R           from 'ramda';
import yaml        from 'js-yaml';
import execa       from 'execa';
import Queue       from 'orderly-queue';
import PrettyError from 'pretty-error';
import by          from 'sort-by';
import normaliseNL from 'normalize-newline';

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

        const isCurrentArray  = Array.isArray(task);
        const isPreviousArray = Array.isArray(tasks[index - 1]);

        if (isCurrentArray || isPreviousArray) {
            return [...xs, ...normalise([].concat(task))];
        }

        const [rest, last] = [R.init(xs), (R.last(xs) || [])];
        return [...rest, [...last, task]];

    }, []);

};

/**
 * @method error
 * @param {String} message
 * @return {void}
 */
export const error = message => {
    const error = new PrettyError();
    console.log(error.render(new Error(message)));
    process.exit(1);
};

/**
 * @method exec
 * @param {Array} tasks
 * @return {Promise}
 */
export const exec = async tasks => {

    /**
     * @method literals
     * @param {String} str
     * @return {String}
     */
    const literals = R.compose(
        str => str.replace(/\\n/ig, '\n'),
        str => str.replace(/\\r/ig, '\r'),
        str => str.replace(/\\t/ig, '\t'),
               normaliseNL
    );

    const queue         = new Queue({ error: () => process.exit(1) });
    const [,,, ...args] = process.argv;

    return tasks.map(group => {

        return queue.process(() => Promise.all(group.map(task => {
            return execa.shell(`${literals(task)} ${args.map(literals).join(' ')}`, { stdio: 'inherit' });
        })));

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
     * @param {String} [path = './']
     * @param {Number} [iteration = 0]
     * @return {Object}
     */
    const locate = (path = './', iteration = 0) => {

        return iteration > MAX_ITERATIONS ? { found: false } : (location => {

            // Determine if the taskfile exists in the current path, otherwise keep iterating until we meet
            // the limit as determined by `MAX_ITERATIONS`.
            return fs.existsSync(location) ? { location, path, found: true } : locate(`${path}../`, iteration + 1);

        })(`${path}${file}`);

    };

    return locate();

};

/**
 * @method env
 * @param {String} environment
 * @return {Function}
 */
export const env = environment => {
    return ({ env = '' }) => env === '' || environment === env;
};

/**
 * @method fill
 * @param {Object} model
 * @return {Object}
 */
export const fill = model => ({ env: '', ...model });

/**
 * @method read
 * @param {String} [file = TASKFILE_RC]
 * @param {String} [environment = process.env.NODE_ENV]
 * @return {Array}
 */
export const read = (file = TASKFILE_RC, environment = process.env.NODE_ENV) => {

    const { found, location } = seek(file);

    /**
     * @method parse
     * @param {String} file
     * @return {Array}
     */
    const parse = file => yaml.safeLoad(fs.readFileSync(file)) || [];

    return found ? parse(location).filter(env(environment)).map(fill).sort(by('-env')).map(model => {

        const tasks = normalise([].concat(model.task || model.tasks));
        return R.omit(['task'], { ...model, tasks });

    }) : error(`Unable to find "${file}" relative to the current directory.`);

};
