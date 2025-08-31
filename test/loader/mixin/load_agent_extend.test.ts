import { strict as assert } from 'node:assert';
import { createApp } from '../../helper.js';

describe('test/loader/mixin/load_agent_extend.test.ts', () => {
  let agent: any;
  before(async () => {
    agent = createApp('agent');
    await agent.loader.loadPlugin();
    await agent.loader.loadConfig();
    await agent.loader.loadAgentExtend();
  });
  after(() => agent.close());

  it('should load extend from chair, plugin and agent', () => {
    assert.ok(agent.poweredBy);
    assert.ok(agent.a);
    assert.ok(agent.b);
    assert.ok(agent.foo);
    assert.ok(agent.bar);
  });

  it('should override chair by plugin', () => {
    assert.ok(agent.a === 'plugin a');
    assert.ok(agent.b === 'plugin b');
    assert.ok(agent.poweredBy === 'plugin a');
  });

  it('should override plugin by agent', () => {
    assert.ok(agent.foo === 'agent bar');
    assert.ok(agent.bar === 'foo');
  });
});
