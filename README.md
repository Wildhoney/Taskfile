![Taskfile](media/logo.png)

> `npm i taskfile --save-dev`<br /><br />
> Yet another attempt at a simple task runner for npm with parallelisation support using bash commands via YAML. Based on the [Taskfile article](https://hackernoon.com/introducing-the-taskfile-5ddfe7ed83bd) by [Adrian Cooney](https://github.com/adriancooney).

![Travis](http://img.shields.io/travis/Wildhoney/Taskfile.svg?style=flat-square)
&nbsp;
![Coveralls](https://img.shields.io/coveralls/Wildhoney/Taskfile.svg?style=flat-square)
&nbsp;
![npm](http://img.shields.io/npm/v/taskfile.svg?style=flat-square)
&nbsp;
![License MIT](https://img.shields.io/badge/license-gpl3-lightgrey.svg?style=flat-square)

[x] Specify pure Bash commands in [YAML](http://yaml.org/)
[x] Run tasks concurrently and consecutively
[x] Compatible with Windows based systems
[x] Avoid wrapper bloat such as with [Gulp](http://gulpjs.com/)
[x] Automatic help page with `taskfile help`
[x] Choice of tasks with `taskfile`
[x] Use `npm run *` commands as usual

## Getting Started

By creating a file named `.taskfile.yml` in your project's root directory, you're able to define the various tasks that Taskfile will respond to.

```yaml
- name: build
  tasks:
    - webpack
    - - prepend bin/index.js '#!/usr/bin/env node\n\n'

- name: test
  tasks:
    - nyc ava
    - - nyc report --reporter=html
```

We have setup two tasks: `taskfile build` and `taskfile test` that will run through their associated tasks consecutively &ndash; we also get `taskfile` which will present users with a list of available tasks.

Taskfile should **not** be installed globally, and as such you're encouraged to place the tasks in your <kbd>package.json</kbd>.

```json
{
    "scripts": {
      "build": "taskfile build",
      "test": "taskfile test"
    }
}
```

We've specified the tasks consecutively in the `.taskfile.yml` file by utilising nested arrays, however we could quite easily set the tasks up concurrently if each tasks doesn't depend on the finishing of the previous. For instance, we could augment our `test` task to spec and lint at the **same** time.

```yaml
- name: test
- tasks:
    - xo **/*.js
    - nyc ava
    - - nyc report --reporter=html
```

Using the above approach our `xo` and `nyc` tasks run concurrently, and once the `nyc` task finishes, it produces a HTML report of test coverage.
