import { exec, spawn } from 'child_process';
import PrettyError from 'pretty-error';
import { read, isWin32 } from './taskfile';

// Take the name of the task, and the remaining args (if any), and then find the task
// based on the passed name.
const [,, name = 'default', ...args] = process.argv;
const task = read().find(model => model.name === name);

// Append the 'node_modules' location to the PATH for a single command only.
const modules = './node_modules/.bin:$PATH';
const command = task && (isWin32 ? `cmd /V /C "set PATH=%path%;${modules} && ${task.tasks}`
                                 : `PATH=${modules} bash -c '${task.tasks}'`);

task ? spawn(command, args, { stdio: 'inherit', shell: true }) : (() => {

    // Render error that we're unable to find the desired task.
    const pe = new PrettyError();
    const renderedError = pe.render(new Error(`Unable to find a task "${name}".`));
    console.log(renderedError);
    process.exit(1);

})();
