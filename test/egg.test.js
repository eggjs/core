'use strict';

const mm = require('mm');
const util = require('util');
const assert = require('assert');
const utils = require('./utils');
const EggCore = require('..').EggCore;
const EggLoader = require('..').EggLoader;

describe('test/egg.test.js', () => {
  afterEach(mm.restore);

  describe('create EggCore', () => {

    class Application extends EggCore {
      get [Symbol.for('egg#loader')]() {
        return EggLoader;
      }
      get [Symbol.for('egg#eggPath')]() {
        return utils.getFilepath('egg');
      }
    }

    let app;
    after(() => app && app.close());

    it('should use cwd when no options', () => {
      app = new Application();
      assert(app._options.baseDir === process.cwd());
    });

    it('should set default application when no type', () => {
      app = new Application();
      assert(app.type === 'application');
    });

    it('should not set value expect for application and agent', () => {
      assert.throws(() => {
        new Application({
          type: 'nothing',
        });
      }, /options.type should be application or agent/);
    });

    it('should throw options.baseDir required', () => {
      assert.throws(() => {
        new Application({
          baseDir: 1,
        });
      }, /options.baseDir required, and must be a string/);
    });

    it('should throw options.baseDir not exist', () => {
      assert.throws(() => {
        new Application({
          baseDir: 'not-exist',
        });
      }, /Directory not-exist not exists/);
    });

    it('should throw options.baseDir is not a directory', () => {
      assert.throws(() => {
        new Application({
          baseDir: __filename,
        });
      }, new RegExp(`Directory ${__filename} is not a directory`));
    });
  });

  describe('getters', () => {
    let app;
    before(() => {
      app = utils.createApp('app-getter');
      app.loader.loadPlugin();
      app.loader.loadConfig();
      return app.ready();
    });
    after(() => app.close());

    it('should has get type', () => {
      assert(app.type === 'application');
    });

    it('should has baseDir', () => {
      assert(app.baseDir === utils.getFilepath('app-getter'));
    });

    it('should has name', () => {
      assert(app.name === 'app-getter');
    });

    it('should has plugins', () => {
      assert(app.plugins);
      assert(app.plugins === app.loader.plugins);
    });

    it('should has config', () => {
      assert(app.config);
      assert(app.config === app.loader.config);
    });
  });

  describe('app.deprecate()', () => {
    let app;
    afterEach(() => app && app.close());

    it('should deprecate with namespace egg', () => {
      app = utils.createApp('plugin');
      const deprecate = app.deprecate;
      assert(deprecate._namespace === 'egg');
      assert(deprecate === app.deprecate);
    });
  });

  describe('app.readyCallback()', () => {
    let app;
    afterEach(() => app.close());

    it('should log info when plugin is not ready', done => {
      app = utils.createApp('notready');
      app.loader.loadAll();
      mm(app.console, 'warn', (message, a) => {
        assert(message === '[egg:core:ready_timeout] 10 seconds later %s was still unable to finish.');
        assert(a === 'a');
        done();
      });
      app.ready(() => {
        throw new Error('should not be called');
      });
    });

    it('should log info when plugin is not ready', done => {
      app = utils.createApp('ready');
      app.loader.loadAll();
      let message = '';
      mm(app.console, 'info', (a, b, c) => {
        message += util.format.apply(null, [ a, b, c ]);
      });
      app.ready(() => {
        assert(/\[egg:core:ready_stat] end ready task a, remain \["b"]/.test(message));
        assert(/\[egg:core:ready_stat] end ready task b, remain \[]/.test(message));
        done();
      });
    });
  });

  describe('app.close()', () => {
    let app;

    it('should emit close event before exit', () => {
      app = utils.createApp('close');
      let called = false;
      app.on('close', () => {
        called = true;
      });
      app.close();
      assert(called === true);
    });

    it('should return a promise', done => {
      app = utils.createApp('close');
      const promise = app.close();
      assert(promise instanceof Promise);
      promise.then(done);
    });

    it('should throw when close error', done => {
      app = utils.createApp('close');
      mm(app, 'removeAllListeners', () => {
        throw new Error('removeAllListeners error');
      });
      app.close().catch(err => {
        assert(err.message === 'removeAllListeners error');
        done();
      });
    });
  });

});
