import { spawn } from 'child_process';
import PrettyError from 'pretty-error';
import { read, exec } from './taskfile';
import { list } from './help';

// Take the name of the task, and then attempt to find the associated line in the YAML config.
const [,, name = null] = process.argv;
const task             = read().find(model => model.name === name);

!name ? list() : task ? exec(task) : (() => {

    // Render error that we're unable to find the desired task.
    const error = new PrettyError();
    console.log(error.render(new Error(`Unable to find the "${name}" task.`)));
    process.exit(1);

})();
