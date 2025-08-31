import { strict as assert } from 'node:assert';
import { createApp } from '../../helper.js';

describe('test/loader/mixin/load_application_extend.test.ts', () => {
  let app: any;
  before(async () => {
    app = createApp('application');
    await app.loader.loadPlugin();
    await app.loader.loadConfig();
    await app.loader.loadApplicationExtend();
  });
  after(() => app.close());

  it('should load extend from chair, plugin and application', () => {
    assert.ok(app.poweredBy);
    assert.ok(app.a);
    assert.ok(app.b);
    assert.ok(app.foo);
    assert.ok(app.bar);
  });

  it('should override chair by plugin', () => {
    assert.ok(app.a === 'plugin a');
    assert.ok(app.b === 'plugin b');
    assert.ok(app.poweredBy === 'plugin a');
  });

  it('should override plugin by app', () => {
    assert.ok(app.foo === 'app bar');
    assert.ok(app.bar === 'foo');
  });
});
