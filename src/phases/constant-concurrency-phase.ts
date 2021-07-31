import { Phase, PhaseContext, PhaseRunResult } from "../phases";
import { Scenario, ScenarioContext, ScenarioRunResult } from "../scenarios";

export interface ConstantConcurrencyPhaseConfig {
  name: string;
  durationSeconds: number;
  concurrency: number;
  scenario: Scenario;
}

export class ConstantConcurrencyPhase implements Phase {
  public readonly name = this.config.name;

  constructor(private config: ConstantConcurrencyPhaseConfig) {}

  async run(context: PhaseContext): Promise<PhaseRunResult> {
    await context.reporter.onPhaseStart(this, context);

    const startTimeMs = Date.now();
    const runningScenarios = new Map<ScenarioContext, Promise<[ScenarioContext, ScenarioRunResult]>>();
    const results: ScenarioRunResult[] = [];

    for (let i = 0; i < this.config.concurrency; i++) {
      const scenarioRun = new ScenarioContext(this, context.reporter);

      runningScenarios.set(
        scenarioRun,
        this.config.scenario.run(scenarioRun).then(
          (result) => [scenarioRun, result],
          (error) => [scenarioRun, error]
        )
      );
    }

    while (runningScenarios.size > 0) {
      // try {
      const [scenarioRun, result] = await Promise.race(runningScenarios.values());
      // } catch (error) {
      //   if (Array.isArray(error)) {
      //     const [scenarioRun, scenarioError] = error;
      //   }
      //
      //   throw error;
      // }

      runningScenarios.delete(scenarioRun);
      results.push(result);

      const hasMoreTime = (Date.now() - startTimeMs) / 1000 < this.config.durationSeconds;
      const needsMoreConcurrency = runningScenarios.size < this.config.concurrency;

      if (hasMoreTime && needsMoreConcurrency) {
        const scenarioRun = new ScenarioContext(this, context.reporter);

        runningScenarios.set(
          scenarioRun,
          this.config.scenario.run(scenarioRun).then(
            (result) => [scenarioRun, result],
            (error) => [scenarioRun, error]
          )
        );
      }
    }

    // TODO: In finally?
    await context.reporter.onPhaseComplete(this, context);

    return {
      phase: this,
      scenarioResults: results
    };
  }

  // private runNewScenario(
  //   startTimeMs: number,
  //   runningScenarios: Set<ScenarioRun>
  // ) {
  //   const scenarioRun = new ScenarioRun();
  //   runningScenarios.add(scenarioRun);
  //
  //   this.config.scenario.run(scenarioRun).finally(() => {
  //     const hasMoreTime = (Date.now() - startTimeMs) / 1000 < this.config.durationSeconds;
  //     const needsMoreConcurrency = runningScenarios.size < this.config.concurrency;
  //
  //     if (hasMoreTime && needsMoreConcurrency) {
  //       this.runNewScenario(startTimeMs, runningScenarios);
  //     }
  //   });
  // }
}
