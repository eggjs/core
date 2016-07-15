'use strict';

const fs = require('fs');
const path = require('path');
const interopRequire = require('interop-require');
const utils = require('./utils');
const debug = require('debug')('egg:extend:loader');

const loadExtend = Symbol('loadExtend');

module.exports = {

  /**
   * 扩展 Agent.prototype 的属性
   *
   * 可加载路径查看 {@link EggLoader#loadDirs}
   * @method EggLoader#loadAgent
   */
  loadAgent() {
    this[loadExtend]('agent', this.app);
  },

  /**
   * 扩展 Application.prototype 的属性
   *
   * 可加载路径查看 {@link EggLoader#loadDirs}
   * @method EggLoader#loadApplication
   */
  loadApplication() {
    this[loadExtend]('application', this.app);
  },

  /**
   * 扩展 Request.prototype 的属性
   *
   * 可加载路径查看 {@link EggLoader#loadDirs}
   * @method EggLoader#loadRequest
   */
  loadRequest() {
    this[loadExtend]('request', this.app.request);
  },

  /**
   * 扩展 Response.prototype 的属性
   *
   * 可加载路径查看 {@link EggLoader#loadDirs}
   * @method EggLoader#loadResponse
   */
  loadResponse() {
    this[loadExtend]('response', this.app.response);
  },

  /**
   * 扩展 Context.prototype 的属性
   *
   * 可加载路径查看 {@link EggLoader#loadDirs}
   * @method EggLoader#loadContext
   */
  loadContext() {
    this[loadExtend]('context', this.app.context);
  },

  /**
   * 扩展 app.Helper.prototype 的属性
   *
   * 可加载路径查看 {@link EggLoader#loadDirs}
   * @method EggLoader#loadHelper
   */
  loadHelper() {
    if (this.app && this.app.Helper) {
      this[loadExtend]('helper', this.app.Helper.prototype);
    }
  },

  /**
   * 加载 extend 基类
   *
   * @method loadExtend
   * @param {String} name - 加载的文件名，如 app/extend/{name}.js
   * @param {Object} proto - 最终将属性合并到 proto 上
   * @private
   */
  [loadExtend](name, proto) {
    // 获取需要加载的文件
    const filepaths = this.loadDirs()
      .map(dir => {
        let pluginExtendsPath = path.join(dir, 'app/extend');
        if (!fs.existsSync(pluginExtendsPath)) {
          pluginExtendsPath = path.join(dir, 'app');
        }
        return path.join(pluginExtendsPath, name);
      });
    const mergeRecord = new Map();
    for (const filepath of filepaths) {
      if (!utils.existsModule(filepath)) {
        continue;
      }

      let ext;
      try {
        ext = interopRequire(filepath);
      } catch (err) {
        err.message = `[egg-loader] load file ${require.resolve(filepath)} error: ${err.message}`;
        throw err;
      }

      const names = Object.getOwnPropertyNames(ext)
        .concat(Object.getOwnPropertySymbols(ext));

      if (names.length === 0) {
        continue;
      }

      for (const name of names) {
        if (mergeRecord.has(name)) {
          debug('Property: "%s" already exists in "%s"，it will be redefined by "%s"',
            name, mergeRecord.get(name), filepath);
        }

        // Copy descriptor
        const descriptor = Object.getOwnPropertyDescriptor(ext, name);
        Object.defineProperty(proto, name, descriptor);
        mergeRecord.set(name, filepath);
      }
      debug('merge %j to %s from %s', Object.keys(ext), name, filepath);
    }

  },
};
