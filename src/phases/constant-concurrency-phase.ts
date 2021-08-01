import { times } from "lodash";
import { Phase, PhaseContext, PhaseRunResult } from "../phases";
import { Scenario } from "../scenarios";

export interface ConstantConcurrencyPhaseConfig {
  name: string;
  durationSeconds: number;
  concurrency: number;
  scenario: Scenario;
}

export class ConstantConcurrencyPhase implements Phase {
  public readonly name = this.config.name;
  public readonly scenario = this.config.scenario;

  constructor(private config: ConstantConcurrencyPhaseConfig) {}

  async run(context: PhaseContext): Promise<PhaseRunResult> {
    await context.reporter.onPhaseStart(this, context);

    const arrayOfResults = await Promise.all(
      times(this.config.concurrency, () => this.scenarioThread(context))
    );

    // TODO: In finally?
    await context.reporter.onPhaseComplete(this, context);

    return {
      phase: this,
      // scenarioResults: flatten(arrayOfResults)
    };
  }

  private async scenarioThread(context: PhaseContext) {
    // TODO: Make this run in batches of up to 1 minute so that reporting
    //       is more responsive.
    const { reporterData } = await context.executor.runQueuedUntil(
      this.name,
      {},
      Date.now() + this.config.durationSeconds * 1000
    );

    await context.reporter.onDataFromWorker(reporterData);
  }

  // private async scenarioThread(context: PhaseContext) {
  //   const startTimeMs = Date.now();
  //   const results = [];
  //
  //   while ((Date.now() - startTimeMs) / 1000 < this.config.durationSeconds) {
  //     const [result] = await context.executor.execute(
  //       this.config.scenario,
  //       this,
  //       context,
  //       1
  //     );
  //
  //     results.push(result!);
  //   }
  //
  //   return results;
  // }
}
