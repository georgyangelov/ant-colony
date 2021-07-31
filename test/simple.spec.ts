import { ConstantConcurrencyPhase, CountingReporter, Scenario, SingleRunPhase, StatsReporter, UnionReporter, TestRun } from "../src";

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

    const countingReporter = new CountingReporter();
    const statsReporter = new StatsReporter();

    const run = new TestRun({
      reporter: new UnionReporter([
        countingReporter,
        statsReporter
      ]),

      httpInterceptor: {
        host: 'example.com'
      },

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

    expect(countingReporter.counters.phases).toEqual(2);

    console.log(statsReporter.stats);

    // expect(countingReporter.counters.scenarios).toBeGreaterThan(149);
    // expect(countingReporter.counters.scenarios).toBeLessThan(154);

    // expect(countingReporter.counters.requests).toBeGreaterThan(149);
    // expect(countingReporter.counters.requests).toBeLessThan(154);

    expect(statsReporter.stats).toEqual([
      expect.objectContaining({ phase: expect.objectContaining({ name: 'single-run' }) }),
      expect.objectContaining({ phase: expect.objectContaining({ name: 'full-load' }) })
    ]);
  }, 100000);
});
