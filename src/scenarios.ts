import { Actions } from './actions';
import { InterceptedResponse } from './lib/node-http-interceptor';
import { Phase } from './phases';
import { WorkerReporter } from './reporter';
import { ContinuationLocal } from './lib/continuation-local';
import { format as formatUrl } from 'url';

export class ScenarioContext {
  constructor(public phase: Phase, public reporter: WorkerReporter<any>) {}
}

export interface IScenario {
  run(context: ScenarioContext): Promise<void>;
}

export class Scenario implements IScenario {
  static current = new ContinuationLocal<{
    scenario: Scenario;
    context: ScenarioContext;
  }>();

  static onInterceptedRequest({
    request,
    response,
    startedAtUnixMs,
    responseTimeMs
  }: InterceptedResponse) {
    const currentScenario = Scenario.current.get();
    if (!currentScenario) {
      return;
    }

    const { scenario, context } = currentScenario;

    context.reporter.onRequestComplete(
      {
        url: formatUrl({
          protocol: request.protocol,
          auth: request.auth,
          host: request.host,
          pathname: request.path,
          port: request.port
        }),
        statusCode: response.statusCode,
        startedAtUnixMs,
        responseTimeMs
      },
      scenario,
      context
    );
  }

  constructor(public name: string, private runFn: (actions: Actions) => Promise<void>) {}

  async run(context: ScenarioContext) {
    await Scenario.current.set({ scenario: this, context }, async () => {
      context.reporter.onScenarioStart(this, context);

      const actions = new Actions(this, context);

      try {
        await this.runFn(actions);
      } finally {
        context.reporter.onScenarioComplete(this, context);
      }
    });
  }
}
