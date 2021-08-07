import {
  ConstantConcurrencyPhase,
  Scenario,
  SingleRunPhase,
  ConsoleReporter,
  LoadTest,
  RandomScenario
} from '../src';

const fetchOnce = new Scenario('Checkout with credit card', async actions => {
  await actions.fetch('http://example.com');
});

const fetchTwice = new Scenario('Just browsing PLP', async actions => {
  await actions.fetch('http://example.com');
  await actions.fetch('http://example.com');
});

const scenario = new RandomScenario([
  { scenario: fetchOnce, weight: 2 },
  { scenario: fetchTwice, weight: 1 }
]);

export default new LoadTest({
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
      durationSeconds: 5,
      concurrency: 10,
      scenario
    })
  ]
});
