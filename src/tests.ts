import { InterceptedResponse, NodeHTTPInterceptor } from "./lib/node-http-interceptor";
import { timed } from "./lib/timed";
import { Phase, PhaseContext, PhaseRunResult } from "./phases";
import { Reporter } from "./reporter";
import { Scenario } from "./scenarios";

export interface TestRunConfig {
  reporter: Reporter;
  httpInterceptor?: { host: string };

  phases: Phase[];
}

export interface TestRunResult {
  totalTimeSeconds: number;

  phaseResults: PhaseRunResult[];
}

export class TestRun {
  constructor(private config: TestRunConfig) {}

  async execute(): Promise<TestRunResult> {
    const interceptorConfig = this.config.httpInterceptor;
    if (interceptorConfig) {
      NodeHTTPInterceptor.startIntercepting();
    }

    function onInterceptedRequest(intercepted: InterceptedResponse) {
      if (interceptorConfig && interceptorConfig.host === intercepted.request.host) {
        Scenario.onInterceptedRequest(intercepted);
      }
    }

    try {
      if (interceptorConfig) {
        NodeHTTPInterceptor.events.on('response', onInterceptedRequest);
      }

      const phaseResults: PhaseRunResult[] = [];

      await this.config.reporter.onRunStart(this);

      const [, totalTimeMs] = await timed(async () => {
        for (const phase of this.config.phases) {
          const phaseContext = new PhaseContext(this.config.reporter);

          const result = await phase.run(phaseContext);

          phaseResults.push(result);
        }
      });

      await this.config.reporter.onRunComplete(this);

      return {
        totalTimeSeconds: totalTimeMs / 1000,
        phaseResults,
      };
    } finally {
      if (interceptorConfig) {
        NodeHTTPInterceptor.events.off('response', onInterceptedRequest);
        NodeHTTPInterceptor.stopIntercepting();
      }
    }
  }
}
