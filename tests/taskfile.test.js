import test from 'ava';
import { read } from '../src/taskfile';

test('should be able to read the meta information;', t => {
    const [task] = read('./tests/mock/meta.yml');
    t.is(task.name, 'js');
    t.is(task.type, 'build');
    t.is(task.desc, 'Test description.');
});

test('should be able to produce a command that is entirely parallel;', t => {

    // Linux, OSX, etc...
    const [firstTask] = read('./tests/mock/parallel.yml', false);
    t.is(firstTask.tasks, 'npm run js & npm run sass & npm run images & wait');

    // Windows.
    const [secondTask] = read('./tests/mock/parallel.yml', true);
    t.is(secondTask.tasks, 'npm run js && npm run sass && npm run images');

});
