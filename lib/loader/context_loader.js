'use strict';

const assert = require('assert');
const is = require('is-type-of');
const FileLoader = require('./file_loader');
const classLoader = Symbol('classLoader');
const EXPORTS = FileLoader.EXPORTS;

class ClassLoader {

  constructor(options) {
    assert(options.ctx, 'options.ctx is required');
    const properties = options.properties;
    this._cache = new Map();
    this._ctx = options.ctx;

    for (const property in properties) {
      this.defineProperty(property, properties[property]);
    }
  }

  defineProperty(property, values) {
    Object.defineProperty(this, property, {
      get() {
        if (!this._cache.has(property)) {
          this._cache.set(property, getInstance(values, this._ctx));
        }
        return this._cache.get(property);
      },
    });
  }
}

class ContextLoader extends FileLoader {

  constructor(options) {
    assert(options.property, 'options.property is required');
    assert(options.inject, 'options.inject is required');
    const target = options.target = {};
    if (options.fieldClass) {
      options.inject[options.fieldClass] = target;
    }
    super(options);

    const app = this.options.inject;


    Object.defineProperty(app.context, options.property, {
      get() {
        if (!this[classLoader]) {
          this[classLoader] = getInstance(target, this);
        }
        return this[classLoader];
      },
    });
  }
}

module.exports = ContextLoader;


function getInstance(values, ctx) {
  const Class = values[EXPORTS] ? values : null;
  let instance;
  if (Class) {
    if (is.class(Class)) {
      instance = new Class(ctx);
    } else {
      instance = Class;
    }
  // Can't set property to primitive, so check again
  } else if (is.primitive(values)) {
    instance = values;
  } else {
    instance = new ClassLoader({ ctx, properties: values });
  }
  return instance;
}
