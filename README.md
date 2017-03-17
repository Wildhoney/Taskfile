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
