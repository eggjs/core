'use strict';

const request = require('supertest');
const utils = require('./utils');

describe('test/load_helper_extend.test.js', function() {

  let app;
  before(function() {
    app = utils.createApp('helper');
  });

  it('should load extend from chair, plugin and helper', function(done) {
    request(app.callback())
    .get('/')
    .expect(/app: true/)
    .expect(/plugin a: false/)
    .expect(/plugin b: true/)
    .expect(200, done);
  });

  it('should override chair by application', function(done) {
    request(app.callback())
    .get('/')
    .expect(/override: app/)
    .expect(200, done);
  });

  it('should not call directly', function(done) {
    request(app.callback())
    .get('/')
    .expect(/not exists on locals: false/)
    .expect(200, done);
  });

});
