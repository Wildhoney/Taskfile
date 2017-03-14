import test from 'ava';
import { read } from '../src/taskfile';

test('x', t => {

    const [firstTask] = read('./tests/mock/taskfile.yml');

    t.is(firstTask.name, 'js');
    t.is(firstTask.type, 'build');
    t.is(firstTask.desc, 'Test description.');

    console.log(firstTask.tasks);

});
