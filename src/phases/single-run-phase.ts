import { Phase, PhaseContext, PhaseRunResult } from "../phases";
import { Scenario, ScenarioContext } from "../scenarios";

export interface SingleRunPhaseConfig {
  name: string;
  scenario: Scenario;
}

export class SingleRunPhase implements Phase {
  public readonly name = this.config.name;

  constructor(private config: SingleRunPhaseConfig) {}

  async run(context: PhaseContext): Promise<PhaseRunResult> {
    context.reporter.onPhaseStart(this, context);

    const scenarioResult = await this.runScenario(context);

    context.reporter.onPhaseComplete(this, context);

    return {
      phase: this,
      scenarioResults: [scenarioResult]
    };
  }

  async runScenario(context: PhaseContext) {
    const scenarioRun = new ScenarioContext(this, context.reporter);

    return this.config.scenario.run(scenarioRun);
  }
}
