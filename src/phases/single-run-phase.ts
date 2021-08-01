import { Phase, PhaseContext, PhaseRunResult } from "../phases";
import { IScenario } from "../scenarios";

export interface SingleRunPhaseConfig {
  name: string;
  scenario: IScenario;
}

export class SingleRunPhase implements Phase {
  public readonly name = this.config.name;
  public readonly scenario = this.config.scenario;

  constructor(private config: SingleRunPhaseConfig) {}

  async run(context: PhaseContext): Promise<PhaseRunResult> {
    await context.reporter.onPhaseStart(this, context);

    await this.runScenario(context);

    await context.reporter.onPhaseComplete(this, context);

    return { phase: this };
  }

  async runScenario(context: PhaseContext) {
    const { reporterData } = await context.executor.runSingle(this.name, {});

    await context.reporter.onDataFromWorker(reporterData);
  }
}
