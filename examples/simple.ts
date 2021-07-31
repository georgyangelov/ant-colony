import {
  ConstantConcurrencyPhase,
  Scenario,
  SingleRunPhase,
  TestRun,
  ConsoleReporter
} from '../src';

const scenario = new Scenario('Just wondering', async (actions) => {
  await actions.fetch('http://example.com');
  await actions.fetch('http://example.com');
});

const run = new TestRun({
  reporter: new ConsoleReporter(),

  httpInterceptor: {
    host: 'example.com'
  },

  phases: [
    new SingleRunPhase({
      name: 'single-run',
      scenario
    }),

    new ConstantConcurrencyPhase({
      name: 'full-load',
      durationSeconds: 25,
      concurrency: 5,
      scenario
    })
  ]
});

run.execute();
