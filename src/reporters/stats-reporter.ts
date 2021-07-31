import { RequestActionInfo } from "../actions";
import { Phase, PhaseContext } from "../phases";
import { Reporter } from "../reporter";
import { Scenario, ScenarioContext } from "../scenarios";
import { TestRun } from "../tests";

export interface PhaseStats {
  phase: Phase;

  startTime: Date;
  endTime: Date;

  scenarioCount: number;
  requestCount: number;
}

export class StatsReporter implements Reporter {
  stats: PhaseStats[] = [];
  currentPhase!: Omit<PhaseStats, 'endTime'>;

  onRunStart(run: TestRun) {}
  onRunComplete(run: TestRun) {}
  onRunError(run: TestRun) {}

  onPhaseStart(phase: Phase, context: PhaseContext) {
    this.currentPhase = {
      phase,
      startTime: new Date(),
      scenarioCount: 0,
      requestCount: 0
    };
  }
  onPhaseComplete(phase: Phase, context: PhaseContext) {
    this.stats.push({
      ...this.currentPhase,

      endTime: new Date()
    });
  }
  onPhaseError(phase: Phase, context: PhaseContext) {}

  onScenarioStart(scenario: Scenario, context: ScenarioContext) {
    this.currentPhase.scenarioCount++;
  }
  onScenarioComplete(scenario: Scenario, context: ScenarioContext) {}
  onScenarioError(scenario: Scenario, context: ScenarioContext) {}

  onRequestComplete(request: RequestActionInfo, scenario: Scenario, context: ScenarioContext) {
    this.currentPhase.requestCount++;
  }
}
