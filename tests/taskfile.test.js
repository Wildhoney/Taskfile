import test from 'ava';
import { read } from '../src/taskfile';

test('should be able to read the meta information;', t => {

    const [task] = read('./tests/mock/meta.yml');
    t.is(task.name, 'js');
    t.is(task.type, 'build');
    t.is(task.desc, 'Test description.');

});

test('should be able to handle a single command;', t => {

    const [firstTask] = read('./tests/mock/single.yml', false);
    t.is(firstTask.tasks, 'npm run js');

});

test('should be able to handle simple concurrency;', t => {

    // Linux, OSX, etc...
    const [firstTask] = read('./tests/mock/concurrent.yml', false);
    t.is(firstTask.tasks, '(npm run js & npm run sass & npm run images & wait)');

    // Windows.
    const [secondTask] = read('./tests/mock/concurrent.yml', true);
    t.is(secondTask.tasks, 'npm run js && npm run sass && npm run images');

});

test('should be able to handle simple consecutively;', t => {

    // Linux, OSX, etc...
    const [firstTask] = read('./tests/mock/consecutive.yml', false);
    t.is(firstTask.tasks, 'npm run js && npm run sass && npm run images');

    // Windows.
    const [secondTask] = read('./tests/mock/consecutive.yml', true);
    t.is(secondTask.tasks, 'npm run js && npm run sass && npm run images');

});

test('should be able to handle a mixture of consecutive and concurrent;', t => {

    // Linux, OSX, etc...
    const [firstTask] = read('./tests/mock/mixture.yml', false);
    t.is(firstTask.tasks, '(npm run js & npm run sass & wait) && (npm run spec & npm run lint & wait) && (npm run images & wait)');

    // // Windows.
    const [secondTask] = read('./tests/mock/mixture.yml', true);
    t.is(secondTask.tasks, 'npm run js && npm run sass && npm run spec && npm run lint && npm run images');

});
