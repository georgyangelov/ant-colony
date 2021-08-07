import { uniq } from 'lodash';
import { Executor } from './executor';
import {
  InterceptedResponse,
  NodeHTTPInterceptor
} from './lib/node-http-interceptor';
import { timed } from './lib/timed';
import { Phase, PhaseContext, PhaseRunResult } from './phases';
import { Reporter } from './reporter';
import { Scenario } from './scenarios';

export interface TestRunConfig {
  reporter: Reporter<any>;
  httpInterceptor?: { host: string };

  phases: Phase[];
}

export interface TestRunResult {
  totalTimeSeconds: number;

  phaseResults: PhaseRunResult[];
}

export class LoadTest {
  public readonly phasesByName = new Map(
    this.config.phases.map(phase => [phase.name, phase])
  );

  constructor(public config: TestRunConfig) {
    LoadTest.validateConfig(this.config);
  }

  static validateConfig(config: TestRunConfig) {
    const phaseNames = config.phases.map(_ => _.name);
    if (uniq(phaseNames).length !== phaseNames.length) {
      throw new Error('Phase names must be unique');
    }
  }

  _startInterceptingHTTP() {
    const interceptorConfig = this.config.httpInterceptor;
    if (interceptorConfig) {
      NodeHTTPInterceptor.startIntercepting();
    }

    function onInterceptedRequest(intercepted: InterceptedResponse) {
      if (
        interceptorConfig &&
        interceptorConfig.host === intercepted.request.host
      ) {
        Scenario.onInterceptedRequest(intercepted);
      }
    }

    if (interceptorConfig) {
      NodeHTTPInterceptor.events.on('response', onInterceptedRequest);
    }

    return () => {
      if (interceptorConfig) {
        NodeHTTPInterceptor.events.off('response', onInterceptedRequest);
        NodeHTTPInterceptor.stopIntercepting();
      }
    };
  }

  async execute(executor: Executor): Promise<TestRunResult> {
    await executor.start();

    const stopIntercepting = this._startInterceptingHTTP();

    try {
      const phaseResults: PhaseRunResult[] = [];

      await this.config.reporter.onRunStart(this);

      const [, totalTimeMs] = await timed(async () => {
        for (const phase of this.config.phases) {
          const phaseContext = new PhaseContext(executor, this.config.reporter);

          const result = await phase.run(phaseContext);

          phaseResults.push(result);
        }
      });

      await this.config.reporter.onRunComplete(this);

      return {
        totalTimeSeconds: totalTimeMs / 1000,
        phaseResults
      };
    } finally {
      stopIntercepting();

      await executor.stop();
    }
  }
}
