const { scheduler } = require('node:timers/promises');

module.exports = class {
  constructor(app) {
    this.app = app;
    app.bootLog = [];
  }

  configDidLoad() {
    this.app.bootLog.push('configDidLoad');
  }

  async didLoad() {
    await scheduler.wait(1);
    this.app.bootLog.push('didLoad');
  }

  async willReady() {
    await scheduler.wait(1);
    throw new Error('willReady error');
  }

  async didReady() {
    await scheduler.wait(1);
    this.app.bootLog.push('didReady');
  }

  async beforeClose() {
    await scheduler.wait(1);
    this.app.bootLog.push('beforeClose');
  }
};
