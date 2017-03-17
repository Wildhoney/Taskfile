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

* Specify pure Bash commands in [YAML](http://yaml.org/)
* Run in parallel using `command1 & command2 & wait`
* Full support for Windows based systems
* Avoid wrapper bloat such as with [Gulp](http://gulpjs.com/)
* Automatic help page with `taskfile help`
* Use `npm run *` commands as usual
* Split up single-line `npm run *` commands

## Getting Started

Taskfile begins with the creation of a YAML configuration file named `.taskfile.yml` that should ideally reside in the root of your project &ndash; although Taskfile will recursively find the `.taskfile.yml` file 10 levels up, which means you're able to invoke `taskfile` from *anywhere*.

```yaml
- name: default
  tasks:
    - taskfile test
    - - taskfile build

- name: build
  tasks:
    - webpack
    - - prepend bin/index.js '#!/usr/bin/env node\n\n'

- name: test
  tasks:
    - nyc ava
    - - nyc report --reporter=html
```

Using the `.taskfile.yml` file above, we have setup three tasks: `taskfile [default]` (`default` is entirely optional), `taskfile build` and `taskfile test` that will run through their associated commands consecutively.

You should then define the aforementioned commands in **package.json's** `script` object.

```json
{
    "scripts": {
      "build": "taskfile build",
      "test": "taskfile test"
    }
}
```
