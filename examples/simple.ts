import {
  ConstantConcurrencyPhase,
  Scenario,
  SingleRunPhase,
  TestRun,
  ConsoleReporter
} from '../src';

const scenario = new Scenario('Just wondering', async (actions) => {
  await actions.fetch('http://localhost:8080');
  await actions.fetch('http://localhost:8080');
});

export default new TestRun({
  reporter: new ConsoleReporter(),

  httpInterceptor: {
    host: 'localhost:8080'
  },

  phases: [
    new SingleRunPhase({
      name: 'single-run',
      scenario
    }),

    new ConstantConcurrencyPhase({
      name: 'full-load',
      durationSeconds: 25,
      concurrency: 20,
      scenario
    })
  ]
});
