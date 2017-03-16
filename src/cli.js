import { exec, spawn } from 'child_process';
import PrettyError from 'pretty-error';
import { read } from './taskfile';

// Take the name of the task, and the remaining args (if any), and then find the task
// based on the passed name.
const [,, name, ...args] = process.argv;
const task = read().find(model => model.name === name);

task ? spawn(`PATH=./node_modules/.bin:$PATH ${task.tasks}`, args, { stdio: 'inherit', shell: true }) : (() => {

    // Render error that we're unable to find the desired task.
    const pe = new PrettyError();
    const renderedError = pe.render(new Error(`Unable to find a task "${name}".`));
    console.log(renderedError);
    process.exit(1);

})();
