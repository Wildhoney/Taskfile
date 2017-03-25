import test from 'ava';
import { chdir } from 'process';
import mock from 'mock-fs';
import { read, seek, fill, env } from '../src/taskfile';

test('should be able to find the .taskfile.yml with backwards recursion;', t => {

    mock({
        '/projects/taskfile/example/css': {
            'empty': {}
        },
        '/projects/taskfile/.taskfile.yml': 'content of taskfile'
    });

    chdir('/projects/taskfile/example/css');
    t.deepEqual(seek(), { location: './../../.taskfile.yml', path: './../../', found: true });

    chdir('/projects');
    t.deepEqual(seek(), { found: false });

    mock.restore();

});

test('should be able to fill in the `env` if unset;', t => {
    t.deepEqual(fill({ name: 'test' }), { name: 'test', env: '' });
    t.deepEqual(fill({ name: 'test', env: 'development' }), { name: 'test', env: 'development' });
});

test('should be able to match against the environment variable;', t => {
    t.true(env('development')({ env: '' }));
    t.true(env('development')({ env: 'development' }));
    t.false(env('development')({ env: 'production' }));
});

test('should be able to read the meta information;', t => {
    const [task] = read('./tests/mock/meta.yml', '');
    t.is(task.name, 'js');
    t.is(task.type, 'build');
    t.is(task.desc, 'Test description.');
});

test('should be able to handle a simple single command;', t => {
    const [task] = read('./tests/mock/simple.yml', '');
    t.deepEqual(task.tasks, [
        ['npm run js']
    ]);
});

test('should be able to handle simple concurrency;', t => {
    const [task] = read('./tests/mock/concurrent.yml', '');
    t.deepEqual(task.tasks, [
        ['npm run js', 'npm run sass', 'npm run images']
    ]);
});

test('should be able to handle simple consecutively;', t => {
    const [task] = read('./tests/mock/consecutive.yml', '');
    t.deepEqual(task.tasks, [
        ['npm run js'],
        ['npm run sass'],
        ['npm run images']
    ]);
});

test('should be able to handle a mixture of consecutive and concurrent;', t => {
    const [task] = read('./tests/mock/mixture.yml', '');
    t.deepEqual(task.tasks, [
        ['npm run js', 'npm run sass'],
        ['npm run spec', 'npm run lint'],
        ['npm run images']
    ]);
});

test('should be able to handle a nested mixture of consecutive and concurrent;', t => {
    const [task] = read('./tests/mock/nested.yml', '');
    t.deepEqual(task.tasks, [
        ['npm run spec'],
        ['npm run coverage'],
        ['npm run lint', 'npm run headless'],
        ['npm run js', 'npm run sass', 'npm run images'],
        ['npm run clean', 'npm run notify']
    ]);
});

test('should be able to handle a single task using "task";', t => {
    const [task] = read('./tests/mock/single.yml', '');
    t.deepEqual(task.tasks, [['npm run spec']]);
});

test('should be able to determine the command based on the NODE_ENV variable;', t => {

    // NODE_ENV is "development".
    const [task] = read('./tests/mock/environment.yml', 'development');
    t.deepEqual(task.tasks, [['npm run build --source-map']]);

    // NODE_ENV is "production".
    const [secondTask] = read('./tests/mock/environment.yml', 'production');
    t.deepEqual(secondTask.tasks, [['npm run build --minify']]);

    // NODE_ENV is an empty string.
    const [thirdTask] = read('./tests/mock/environment.yml', '');
    t.deepEqual(thirdTask.tasks, [['npm run build']]);

    // NODE_ENV is undefined.
    const [fourthTask] = read('./tests/mock/environment.yml', undefined);
    t.deepEqual(fourthTask.tasks, [['npm run build']]);

});
