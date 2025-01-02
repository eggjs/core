import type { EggCore, Context } from './egg.js';

/**
 * BaseContextClass is a base class that can be extended,
 * it's instantiated in context level,
 * {@link Helper}, {@link Service} is extending it.
 */
export class BaseContextClass<T extends Context = Context> {
  ctx: T;
  app: EggCore;
  config: Record<string, any>;
  service: BaseContextClass<T>;

  /**
   * @since 1.0.0
   */
  constructor(ctx: T) {
    /**
     * @member {Context} BaseContextClass#ctx
     * @since 1.0.0
     */
    this.ctx = ctx;
    /**
     * @member {Application} BaseContextClass#app
     * @since 1.0.0
     */
    this.app = ctx.app;
    /**
     * @member {Config} BaseContextClass#config
     * @since 1.0.0
     */
    this.config = ctx.app.config;
    /**
     * @member {Service} BaseContextClass#service
     * @since 1.0.0
     */
    this.service = ctx.service as BaseContextClass<T>;
  }
}
