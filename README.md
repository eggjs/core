# egg-core

[![NPM version][npm-image]][npm-url]
[![Node.js CI](https://github.com/eggjs/egg-core/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eggjs/egg-core/actions/workflows/nodejs.yml)
[![Test coverage][codecov-image]][codecov-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-core.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-core
[codecov-image]: https://codecov.io/github/eggjs/egg-core/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/eggjs/egg-core?branch=master
[snyk-image]: https://snyk.io/test/npm/egg-core/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-core
[download-image]: https://img.shields.io/npm/dm/egg-core.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-core

A core Pluggable framework based on [koa](https://github.com/koajs/koa).

**Don't use it directly, see [egg](https://github.com/eggjs/egg).**

## Usage

Directory structure

```
├── package.json
├── app.js (optional)
├── agent.js (optional)
├── app
|   ├── router.js
│   ├── controller
│   │   └── home.js
|   ├── extend (optional)
│   |   ├── helper.js (optional)
│   |   ├── filter.js (optional)
│   |   ├── request.js (optional)
│   |   ├── response.js (optional)
│   |   ├── context.js (optional)
│   |   ├── application.js (optional)
│   |   └── agent.js (optional)
│   ├── service (optional)
│   ├── middleware (optional)
│   │   └── response_time.js
│   └── view (optional)
|       ├── layout.html
│       └── home.html
├── config
|   ├── config.default.js
│   ├── config.prod.js
|   ├── config.test.js (optional)
|   ├── config.local.js (optional)
|   ├── config.unittest.js (optional)
│   └── plugin.js
```

Then you can start with code below

```js
const Application = require('egg-core').EggCore;
const app = new Application({
  baseDir: '/path/to/app'
});
app.ready(() => app.listen(3000));
```

## EggLoader

EggLoader can easily load files or directories in your [egg] project. In addition, you can customize the loader with low level APIs.

### constructor

- {String} baseDir - current directory of application
- {Object} app - instance of egg application
- {Object} plugins - merge plugins for test
- {Logger} logger - logger instance，default is console

### High Level APIs

#### loadPlugin

Load config/plugin.js

#### loadConfig

Load config/config.js and config/{serverEnv}.js

If `process.env.EGG_APP_CONFIG` is exists, then it will be parse and override config.

#### loadController

Load app/controller

#### loadMiddleware

Load app/middleware

#### loadApplicationExtend

Load app/extend/application.js

#### loadContextExtend

Load app/extend/context.js

#### loadRequestExtend

Load app/extend/request.js

#### loadResponseExtend

Load app/extend/response.js

#### loadHelperExtend

Load app/extend/helper.js

#### loadCustomApp

Load app.js, if app.js export boot class, then trigger configDidLoad

#### loadCustomAgent

Load agent.js, if agent.js export boot class, then trigger configDidLoad

#### loadService

Load app/service

### Low Level APIs

#### getServerEnv()

Retrieve application environment variable values via `serverEnv`. You can access directly by calling `this.serverEnv` after instantiation.

serverEnv | description
---       | ---
default   | default environment
test      | system integration testing environment
prod      | production environment
local     | local environment on your own computer
unittest  | unit test environment

#### getEggPaths()

To get directories of the frameworks. A new framework is created by extending egg, then you can use this function to get all frameworks.

#### getLoadUnits()

A loadUnit is a directory that can be loaded by EggLoader, cause it has the same structure.

This function will get add loadUnits follow the order:

1. plugin
2. framework
3. app

loadUnit has a path and a type. Type must be one of those values: *app*, *framework*, *plugin*.

```js
{
  path: 'path/to/application',
  type: 'app'
}
```

#### getAppname()

To get application name from *package.json*

#### appInfo

Get the infomation of the application

- pkg: `package.json`
- name: the application name from `package.json`
- baseDir: current directory of application
- env: equals to serverEnv
- HOME: home directory of the OS
- root: baseDir when local and unittest, HOME when other environment

#### loadFile(filepath)

To load a single file. **Note:** The file must export as a function.

#### loadToApp(directory, property, LoaderOptions)

To load files from directory in the application.

Invoke `this.loadToApp('$baseDir/app/controller', 'controller')`, then you can use it by `app.controller`.

#### loadToContext(directory, property, LoaderOptions)

To load files from directory, and it will be bound the context.

```js
// define service in app/service/query.js
module.exports = class Query {
  constructor(ctx) {
    super(ctx);
    // get the ctx
  }

  async get() {}
};

// use the service in app/controller/home.js
module.exports = async ctx => {
  ctx.body = await ctx.service.query.get();
};
```

#### loadExtend(name, target)

Loader app/extend/xx.js to target, For example,

```js
this.loadExtend('application', app);
```

### LoaderOptions

Param          | Type           | Description
-------------- | -------------- | ------------------------
directory      | `String/Array` | directories to be loaded
target         | `Object`       | attach the target object from loaded files
match          | `String/Array` | match the files when load, default to `**/*.js`(if process.env.EGG_TYPESCRIPT was true, default to `[ '**/*.(js|ts)', '!**/*.d.ts' ]`)
ignore         | `String/Array` | ignore the files when load
initializer    | `Function`     | custom file exports, receive two parameters, first is the inject object(if not js file, will be content buffer), second is an `options` object that contain `path`
caseStyle      | `String/Function` | set property's case when converting a filepath to property list.
override       | `Boolean`      | determine whether override the property when get the same name
call           | `Boolean`      | determine whether invoke when exports is function
inject         | `Object`       | an object that be the argument when invoke the function
filter         | `Function`     | a function that filter the exports which can be loaded

## Timing

EggCore record boot progress with `Timing`, include:

- Process start time
- Script start time(node don't implement an interface like `process.uptime` to record the script start running time, framework can implement a prestart file used with node `--require` options to set `process.scriptTime`)
- Application start time
- Load duration
- `require` duration

### start

Start record a item. If the item exits, end the old one and start a new one.

- {String} name - record item name
- {Number} [start] - record item start time, default is Date.now()

### end

End a item.

- {String} name - end item name

### toJSON

Generate all record items to json

- {String} name - record item name
- {Number} start - item start time
- {Number} end - item end time
- {Number} duration - item duration
- {Number} pid - pid
- {Number} index - item index

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)

## Contributors

[![Contributors](https://contrib.rocks/image?repo=eggjs/core)](https://github.com/eggjs/core/graphs/contributors)

Made with [contributors-img](https://contrib.rocks).
