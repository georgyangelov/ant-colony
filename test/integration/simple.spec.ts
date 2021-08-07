import {
  AsyncExecutor,
  LoadTest,
  Scenario,
  SingleRunPhase,
  StatsReporter
} from '../../src';

describe('Simple load test', () => {
  it('runs phases one by one', async () => {
    let called = 0;

    const scenario = new Scenario('Something', async () => {
      called++;
    });

    const statsReporter = new StatsReporter();

    const phaseOne = new SingleRunPhase({ name: 'single-run', scenario });
    const phaseTwo = new SingleRunPhase({ name: 'two', scenario });

    const test = new LoadTest({
      reporter: statsReporter,
      phases: [phaseOne, phaseTwo]
    });

    const executor = new AsyncExecutor(test);

    await test.execute(executor);

    expect(called).toEqual(2);

    expect(statsReporter.stats).toEqual([
      expect.objectContaining({ phase: phaseOne, scenarioCount: 1 }),
      expect.objectContaining({ phase: phaseTwo, scenarioCount: 1 })
    ]);
  });
});
