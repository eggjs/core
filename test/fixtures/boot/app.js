const { scheduler } = require('node:timers/promises');

module.exports = class {
  constructor(app) {
    app.bootLog = [];
    this.app = app;
  }

  configWillLoad() {
    this.app.config.appSet = true;
  }

  configDidLoad() {
    this.app.bootLog.push('configDidLoad in app');
  }

  async didLoad() {
    await scheduler.wait(1);
    this.app.bootLog.push('didLoad');
  }

  async willReady() {
    await scheduler.wait(1);
    this.app.bootLog.push('willReady');
  }

  async didReady() {
    await scheduler.wait(1);
    this.app.bootLog.push('didReady');
  }

  async beforeClose() {
    await scheduler.wait(1);
    this.app.bootLog.push('beforeClose');
  }

  async serverDidReady() {
    await scheduler.wait(1);
    this.app.bootLog.push('serverDidReady');
  }
};
