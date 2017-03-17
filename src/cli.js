import { spawn } from 'child_process';
import PrettyError from 'pretty-error';
import { read, isWin32 } from './taskfile';
import { list } from './help';

// Take the name of the task, and then attempt to find the associated line in the YAML config.
const [,, name = 'default'] = process.argv;
const task = read().find(model => model.name === name);

/**
 * @method run
 * @param {String} task
 * @return {void}
 */
export const run = task => {

    // Append the 'node_modules' location to the PATH for a single command only, and then spawn the selected task.
    const [,,, ...args] = process.argv;
    const binPath       = './node_modules/.bin';
    const command       = isWin32 ? `cmd /V /C "set PATH=%path%;${binPath} && ${task}` : `PATH=${binPath}:$PATH bash -c '${task}'`;
    spawn(command, args, { stdio: 'inherit', shell: true });

};

name === 'help' ? list() : task ? run(task.tasks) : (() => {

    // Render error that we're unable to find the desired task.
    const error = new PrettyError();
    console.log(error.render(new Error(`Unable to find the "${name}" task.`)));
    process.exit(1);

})();
