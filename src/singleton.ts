import assert from 'node:assert';
import { isAsyncFunction } from 'is-type-of';
import type { EggCore } from './egg.js';

export type SingletonCreateMethod = (
  config: Record<string, any>,
  app: EggCore,
  clientName: string
) => unknown | Promise<unknown>;

export interface SingletonOptions {
  name: string;
  app: EggCore;
  create: SingletonCreateMethod;
}

export class Singleton<T = any> {
  readonly clients = new Map<string, T>();
  readonly app: EggCore;
  readonly create: SingletonCreateMethod;
  readonly name: string;
  readonly options: Record<string, any>;

  constructor(options: SingletonOptions) {
    assert(
      options.name,
      '[@eggjs/core/singleton] Singleton#constructor options.name is required'
    );
    assert(
      options.app,
      '[@eggjs/core/singleton] Singleton#constructor options.app is required'
    );
    assert(
      options.create,
      '[@eggjs/core/singleton] Singleton#constructor options.create is required'
    );
    assert(
      !(options.name in options.app),
      `[@eggjs/core/singleton] ${options.name} is already exists in app`
    );
    this.app = options.app;
    this.name = options.name;
    this.create = options.create;
    this.options = options.app.config[this.name] ?? {};
  }

  init() {
    return isAsyncFunction(this.create) ? this.initAsync() : this.initSync();
  }

  initSync() {
    const options = this.options;
    assert(
      !(options.client && options.clients),
      `[@eggjs/core/singleton] ${this.name} can not set options.client and options.clients both`
    );

    // alias app[name] as client, but still support createInstance method
    if (options.client) {
      const client = this.createInstance(options.client, options.name);
      this.#setClientToApp(client);
      this.#extendDynamicMethods(client);
      return;
    }

    // multi client, use app[name].getSingletonInstance(id)
    if (options.clients) {
      for (const id of Object.keys(options.clients)) {
        const client = this.createInstance(options.clients[id], id);
        this.clients.set(id, client);
      }
      this.#setClientToApp(this);
      return;
    }

    // no config.clients and config.client
    this.#setClientToApp(this);
  }

  async initAsync() {
    const options = this.options;
    assert(
      !(options.client && options.clients),
      `[@eggjs/core/singleton] ${this.name} can not set options.client and options.clients both`
    );

    // alias app[name] as client, but still support createInstance method
    if (options.client) {
      const client = await this.createInstanceAsync(
        options.client,
        options.name
      );
      this.#setClientToApp(client);
      this.#extendDynamicMethods(client);
      return;
    }

    // multi client, use app[name].getInstance(id)
    if (options.clients) {
      await Promise.all(
        Object.keys(options.clients).map((id: string) => {
          return this.createInstanceAsync(options.clients[id], id).then(
            client => this.clients.set(id, client)
          );
        })
      );
      this.#setClientToApp(this);
      return;
    }

    // no config.clients and config.client
    this.#setClientToApp(this);
  }

  #setClientToApp(client: unknown) {
    Reflect.set(this.app, this.name, client);
  }

  /**
   * @deprecated please use `getSingletonInstance(id)` instead
   */
  get(id: string) {
    return this.clients.get(id) as T;
  }

  /**
   * Get singleton instance by id
   */
  getSingletonInstance(id: string) {
    return this.clients.get(id) as T;
  }

  createInstance(config: Record<string, any>, clientName: string) {
    // async creator only support createInstanceAsync
    assert(
      !isAsyncFunction(this.create),
      `[@eggjs/core/singleton] ${this.name} only support asynchronous creation, please use createInstanceAsync`
    );
    // options.default will be merge in to options.clients[id]
    config = {
      ...this.options.default,
      ...config,
    };
    return (this.create as SingletonCreateMethod)(
      config,
      this.app,
      clientName
    ) as T;
  }

  async createInstanceAsync(config: Record<string, any>, clientName: string) {
    // options.default will be merge in to options.clients[id]
    config = {
      ...this.options.default,
      ...config,
    };
    return (await this.create(config, this.app, clientName)) as T;
  }

  #extendDynamicMethods(client: any) {
    assert(
      !client.createInstance,
      '[@eggjs/core/singleton] singleton instance should not have createInstance method'
    );
    assert(
      !client.createInstanceAsync,
      '[@eggjs/core/singleton] singleton instance should not have createInstanceAsync method'
    );

    try {
      let extendable = client;
      // Object.preventExtensions() or Object.freeze()
      if (!Object.isExtensible(client) || Object.isFrozen(client)) {
        // eslint-disable-next-line no-proto
        extendable = client.__proto__ || client;
      }
      extendable.createInstance = this.createInstance.bind(this);
      extendable.createInstanceAsync = this.createInstanceAsync.bind(this);
    } catch (err) {
      this.app.coreLogger.warn(
        '[@eggjs/core/singleton] %s dynamic create is disabled because of client is un-extendable',
        this.name
      );
      this.app.coreLogger.warn(err);
    }
  }
}
