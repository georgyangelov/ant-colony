import { ConstantConcurrencyPhase, CountingReporter, Scenario, SingleRunPhase, TestRun } from "../src";

const jestConsole = console;

beforeEach(() => {
  global.console = require('console');
});

afterEach(() => {
  global.console = jestConsole;
});

describe('Simple examples', () => {
  it('works', async () => {
    const scenario = new Scenario('Just wondering', async (actions) => {
      await actions.fetch('http://example.com');
    });

    const reporter = new CountingReporter();

    const run = new TestRun({
      reporter,

      phases: [
        new SingleRunPhase({
          name: 'single-run',
          scenario
        }),

        // new RampPhase({
        //   name: 'ramp-up',
        //   durationSeconds: 20,
        //
        //   concurrency: {
        //     from: 5,
        //     to: 10
        //   },
        //
        //   scenario
        // }),

        new ConstantConcurrencyPhase({
          name: 'full-load',
          durationSeconds: 10,
          concurrency: 10,
          scenario
        })
      ]
    });

    const results = await run.execute();

    console.log(results);

    expect(reporter.counters.phases).toEqual(2);

    expect(reporter.counters.scenarios).toBeGreaterThan(149);
    expect(reporter.counters.scenarios).toBeLessThan(154);

    expect(reporter.counters.requests).toBeGreaterThan(149);
    expect(reporter.counters.requests).toBeLessThan(154);
  }, 100000);
});
