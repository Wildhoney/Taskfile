import { spawn } from 'child_process';
import PrettyError from 'pretty-error';
import { read, exec } from './taskfile';
import { list } from './help';

const [,, name = null] = process.argv;
const task             = read().find(model => model.name === name);

!name ? list() : task ? exec(task.tasks) : do {

    const error = new PrettyError();
    console.log(error.render(new Error(`Unable to find the "${name}" task.`)));
    process.exit(1);

};
