import { Phase, PhaseContext, PhaseRunResult } from '../phases';
import { IScenario } from '../scenarios';

export interface ConstantConcurrencyPhaseConfig {
  name: string;
  durationSeconds: number;
  concurrency: number;
  scenario: IScenario;
}

export class ConstantConcurrencyPhase implements Phase {
  public readonly name = this.config.name;
  public readonly scenario = this.config.scenario;

  constructor(private config: ConstantConcurrencyPhaseConfig) {}

  async run(context: PhaseContext): Promise<PhaseRunResult> {
    await context.reporter.onPhaseStart(this, context);

    // TODO: Make this run in batches of up to a few minutes so that reporting
    //       is more responsive.
    const results = await context.executor.runQueuedFor(
      this.name,
      {},
      this.config.durationSeconds * 1000,
      this.config.concurrency
    );

    await Promise.all(
      results.map(result => context.reporter.onDataFromWorker(result))
    );

    // TODO: In finally?
    await context.reporter.onPhaseComplete(this, context);

    return { phase: this };
  }
}
