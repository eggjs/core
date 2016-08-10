'use strict';

const should = require('should');
const request = require('supertest');
const mm = require('mm');
const utils = require('../../utils');

describe('test/loader/mixin/load_service.test.js', function() {
  let app;
  afterEach(mm.restore);
  afterEach(() => app.close());

  it('should load from application and plugin', function(done) {
    app = utils.createApp('plugin');
    app.loader.loadPlugin();
    app.loader.loadApplicationExtend();
    app.loader.loadService();
    app.loader.loadController();
    app.loader.loadRouter();
    should.exists(app.serviceClasses.foo);
    should.exists(app.serviceClasses.foo2);
    should.not.exists(app.serviceClasses.bar1);
    should.exists(app.serviceClasses.bar2);
    should.exists(app.serviceClasses.foo4);

    request(app.callback())
    .get('/')
    .expect({
      foo2: 'foo2',
      foo3: 'foo3',
      foo4: true,
      foo5: true,
      foo: true,
      bar2: true,
    })
    .expect(200, done);
  });

  it('should throw when dulplicate', function() {
    (function() {
      app = utils.createApp('service-override');
      app.loader.loadPlugin();
      app.loader.loadService();
    }).should.throw(/^can't overwrite property 'foo'/);
  });

  it('should check es6', function() {
    app = utils.createApp('services_loader_verify');
    app.loader.loadPlugin();
    app.loader.loadApplicationExtend();
    app.loader.loadService();
    app.serviceClasses.should.have.property('foo');
    app.serviceClasses.foo.should.have.properties('bar', 'bar1', 'aa');
  });

  it('should extend app.Service', function(done) {
    app = utils.createApp('extends-app-service');
    app.loader.loadPlugin();
    app.loader.loadApplicationExtend();
    app.loader.loadService();
    app.loader.loadController();
    app.loader.loadRouter();

    request(app.callback())
    .get('/user')
    .expect(function(res) {
      res.body.user.should.eql('123mock');
    })
    .expect(200, done);
  });

  describe('subdir', function() {

    it('should load 2 level dir', function(done) {
      mm(process.env, 'NO_DEPRECATION', '*');
      app = utils.createApp('subdir-services');
      app.loader.loadPlugin();
      app.loader.loadApplicationExtend();
      app.loader.loadService();
      app.loader.loadController();
      app.loader.loadRouter();
      request(app.callback())
      .get('/')
      .expect({
        user: {
          uid: '123',
        },
        cif: {
          uid: '123cif',
          cif: true,
        },
        bar1: {
          name: 'bar1name',
          bar: 'bar1',
        },
        bar2: {
          name: 'bar2name',
          bar: 'bar2',
        },
        'foo.subdir2.sub2': {
          name: 'bar3name',
          bar: 'bar3',
        },
        subdir11bar: {
          bar: 'bar111',
        },
        ok: {
          ok: true,
        },
        cmd: {
          cmd: 'hihi',
          method: 'GET',
          url: '/',
        },
        serviceIsSame: true,
        oldStyle: '/',
      })
      .expect(200, done);
    });

  });
});
