import {
  ConstantConcurrencyPhase,
  Scenario,
  SingleRunPhase,
  ConsoleReporter,
  LoadTest,
  RandomScenario
} from '../src';

const fetchOnce = new Scenario('Fetch once', async actions => {
  await actions.fetch('http://localhost:8080');
});

const fetchTwice = new Scenario('Fetch twice', async actions => {
  await actions.fetch('http://localhost:8080');
  await actions.fetch('http://localhost:8080');
});

const scenario = new RandomScenario([
  { scenario: fetchOnce, weight: 2 },
  { scenario: fetchTwice, weight: 1 }
]);

export default new LoadTest({
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
