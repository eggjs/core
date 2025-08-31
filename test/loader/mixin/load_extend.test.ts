import assert from 'node:assert/strict';

import { request } from '@eggjs/supertest';
import { mm } from 'mm';

import { createApp, type Application } from '../../helper.js';

describe('test/loader/mixin/load_extend.test.ts', () => {
  let app: Application;
  before(async () => {
    app = createApp('extend');
    await app.loader.loadPlugin();
    await app.loader.loadConfig();
    await app.loader.loadRequestExtend();
    await app.loader.loadResponseExtend();
    await app.loader.loadApplicationExtend();
    await app.loader.loadContextExtend();
    await app.loader.loadController();
    await app.loader.loadRouter();
    await app.loader.loadMiddleware();
  });
  after(() => app.close());
  afterEach(mm.restore);

  it('should load app.context app.request app.response', () => {
    assert.ok(app.context.appContext, 'app.context.appContext');
    assert.ok(app.context.pluginbContext, 'app.context.pluginbContext');
    assert.ok(!app.context.pluginaContext, '!app.context.pluginaContext');
    assert.ok(app.request.appRequest, 'app.request.appRequest');
    assert.ok(app.request.pluginbRequest, 'app.request.pluginbRequest');
    assert.ok(!app.request.pluginaRequest, '!app.request.pluginaRequest');
    assert.ok(app.response.appResponse, 'app.response.appResponse');
    assert.ok(app.response.pluginbResponse, 'app.response.pluginbResponse');
    assert.ok(!app.response.pluginaResponse, '!app.response.pluginaResponse');
    assert.ok((app as any).appApplication, 'appApplication');
    assert.ok((app as any).pluginbApplication, 'pluginbApplication');
    assert.ok(!(app as any).pluginaApplication, 'pluginaApplication');

    return request(app.callback())
      .get('/')
      .expect({
        returnAppContext: 'app context',
        returnPluginbContext: 'plugin b context',
        returnAppRequest: 'app request',
        returnPluginbRequest: 'plugin b request',
        returnAppResponse: 'app response',
        returnPluginbResponse: 'plugin b response',
        returnAppApplication: 'app application',
        returnPluginbApplication: 'plugin b application',
        status: 200,
        etag: 'etag ok',
      })
      .expect(200);
  });

  it('should load application overriding framework', async () => {
    await request(app.callback())
      .get('/merge/app_override_chair')
      .expect({
        value: 'app ajax patch',
      })
      .expect(200);
  });

  it('should load plugin overriding framework', async () => {
    await request(app.callback())
      .get('/merge/plugin_override_chair')
      .expect({
        value: '0.0.0.0',
      })
      .expect(200);
  });

  it('should load application overriding plugin', async () => {
    await request(app.callback())
      .get('/merge/app_override_plugin')
      .expect({
        value: 'will override plugin',
      })
      .expect(200);
  });

  it('should throw when no deps', async () => {
    await assert.rejects(async () => {
      const app = createApp('load_context_error');
      await app.loader.loadContextExtend();
    }, /Cannot find module 'this is a pen'/);
  });

  it('should throw when syntax error', async () => {
    await assert.rejects(async () => {
      const app = createApp('load_context_syntax_error');
      await app.loader.loadContextExtend();
    }, /error: Unexpected end of input/);
  });

  it('should extend symbol', async () => {
    const app = createApp('extend-symbol');
    await app.loader.loadApplicationExtend();
    assert.equal((app as any)[Symbol.for('view')], 'view');
  });

  it('should load application by custom env', async () => {
    mm(process.env, 'EGG_SERVER_ENV', 'custom');
    const app = createApp('extend-env');
    await app.loader.loadPlugin();
    await app.loader.loadApplicationExtend();
    assert.ok((app as any).custom === true);
    // application.custom.js override application.js
    assert.ok((app as any).a === 'a1');
    // application.custom.js in plugin also can override application.js in app
    assert.ok((app as any).b === 'b1');
  });

  it('should not load extend that returned function', async () => {
    const proto: any = {};
    await app.loader.loadExtend('call', proto);
    assert.ok(proto.call === undefined);
  });

  describe('load unittest extend', () => {
    let app: Application;
    after(() => app.close());

    it('should load unittext.js when unittest', async () => {
      app = createApp('load-plugin-unittest');
      await app.loader.loadPlugin();
      await app.loader.loadApplicationExtend();
      assert.ok((app as any).unittest === true);
      assert.ok((app as any).local !== true);
    });

    it('should load unittext.js when mm.env(default)', async () => {
      mm(process.env, 'EGG_SERVER_ENV', 'local');
      mm(process.env, 'EGG_MOCK_SERVER_ENV', 'local');
      app = createApp('load-plugin-unittest');
      await app.loader.loadPlugin();
      await app.loader.loadApplicationExtend();
      assert.ok((app as any).unittest === true);
      assert.ok((app as any).local === true);
    });
  });
});
