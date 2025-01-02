import { strict as assert } from 'node:assert';
import { mm } from 'mm';
import { Application, createApp, getFilepath } from '../helper.js';

describe('test/loader/get_app_info.test.ts', () => {
  let app: Application;
  afterEach(() => app.close());
  afterEach(mm.restore);

  it('should get appInfo', () => {
    app = createApp('appinfo');
    assert.equal(app.loader.appInfo.name, 'appinfo');
    assert.equal(app.loader.appInfo.baseDir, getFilepath('appinfo'));
    assert.equal(app.loader.appInfo.env, 'unittest');
    assert.equal(app.loader.appInfo.HOME, process.env.HOME);
    assert.deepEqual(app.loader.appInfo.pkg, {
      name: 'appinfo',
    });
  });

  it('should get root when unittest', () => {
    mm(process.env, 'EGG_SERVER_ENV', 'unittest');
    app = createApp('appinfo');
    assert.equal(app.loader.appInfo.root, getFilepath('appinfo'));
  });

  it('should get root when unittest', () => {
    mm(process.env, 'EGG_SERVER_ENV', 'local');
    app = createApp('appinfo');
    assert.equal(app.loader.appInfo.root, getFilepath('appinfo'));
  });

  it('should get root when unittest', () => {
    mm(process.env, 'EGG_SERVER_ENV', 'default');
    app = createApp('appinfo');
    assert.equal(app.loader.appInfo.root, process.env.HOME);
  });

  it('should get scope when specified', () => {
    mm(process.env, 'EGG_SERVER_SCOPE', 'en');
    app = createApp('appinfo');
    assert.equal(app.loader.appInfo.scope, 'en');
  });
});
