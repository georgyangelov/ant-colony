import { times } from "lodash";
import { ExecutionResult, Executor, ExecutorRunContext } from "../executor";
import { Phase } from "../phases";
import { BaseWorkerData, WorkerReporter } from "../reporter";
import { ScenarioContext } from "../scenarios";
import { TestRun } from "../tests";

export class AsyncExecutor implements Executor {
  constructor(
    private test: TestRun
  ) {}

  async start(): Promise<void> {}
  async stop(): Promise<void> {}

  async runSingle(
    phaseName: string,
    context: ExecutorRunContext
  ): Promise<ExecutionResult> {
    const phase = this.findPhase(phaseName);

    return this.withWorkerReporter(phase, workerReporter => {
      return this.runOne(phase, workerReporter);
    });
  }

  async runQueued(
    phaseName: string,
    context: ExecutorRunContext,
    count: number
  ): Promise<ExecutionResult> {
    const phase = this.findPhase(phaseName);

    return this.withWorkerReporter(phase, async workerReporter => {
      for (let i = 0; i < count; i++) {
        await this.runOne(phase, workerReporter);
      }
    });
  }

  async runQueuedUntil(
    phaseName: string,
    context: ExecutorRunContext,
    unixTimeMs: number
  ): Promise<ExecutionResult> {
    const phase = this.findPhase(phaseName);

    return this.withWorkerReporter(phase, async workerReporter => {
      while (Date.now() < unixTimeMs) {
        await this.runOne(phase, workerReporter);
      }
    });
  }

  async runParallel(
    phaseName: string,
    context: ExecutorRunContext,
    count: number
  ): Promise<ExecutionResult[]> {
    const phase = this.findPhase(phaseName);

    const workerData = await this.withWorkerReporter(phase, async workerReporter => {
      const scenarioRuns = times(count, () => this.runOne(phase, workerReporter));

      await Promise.all(scenarioRuns);
    });

    return [workerData];
  }

  private findPhase(phaseName: string) {
    const phase = this.test.phasesByName.get(phaseName);
    if (!phase) {
      throw new Error(`Cannot find phase ${phaseName}`);
    }

    return phase;
  }

  private async runOne(phase: Phase, reporter: WorkerReporter<any>) {
    const scenarioContext = new ScenarioContext(phase, reporter);

    await phase.scenario.run(scenarioContext);
  }

  private async withWorkerReporter<T extends BaseWorkerData>(
    phase: Phase,
    action: (workerReporter: WorkerReporter<T>) => Promise<void>
  ) {
    const reporter = this.test.config.reporter;
    const workerReporter = reporter.workerReporterFor(this.test, phase);

    await workerReporter.init();

    // TODO: Error handling
    await action(workerReporter);

    const reporterData = workerReporter.complete();

    return { reporterData };
  }
}
