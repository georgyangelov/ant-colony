import { times } from "lodash";
import { Phase, PhaseContext, PhaseRunResult } from "../phases";
import { IScenario } from "../scenarios";

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

    await Promise.all(
      times(this.config.concurrency, () => this.scenarioThread(context))
    );

    // TODO: In finally?
    await context.reporter.onPhaseComplete(this, context);

    return { phase: this };
  }

  private async scenarioThread(context: PhaseContext) {
    // TODO: Make this run in batches of up to 1 minute so that reporting
    //       is more responsive.
    const { reporterData } = await context.executor.runQueuedFor(
      this.name,
      {},
      this.config.durationSeconds * 1000
    );

    await context.reporter.onDataFromWorker(reporterData);
  }
}
