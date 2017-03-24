import { read, exec, error } from './taskfile';
import { list }              from './help';

const [,, name = null] = process.argv;
const task             = read().find(model => model.name === name);

name ? task ? exec(task.tasks) : error(`Unable to find the "${name}" task.`) : list();
