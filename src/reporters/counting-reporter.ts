import { RequestActionInfo } from "../actions";
import { Phase, PhaseContext } from "../phases";
import { Reporter } from "../reporter";
import { Scenario, ScenarioContext } from "../scenarios";
import { TestRun } from "../tests";

export class CountingReporter implements Reporter {
  counters = {
    phases: 0,
    scenarios: 0,
    requests: 0
  };

  onRunStart(run: TestRun) {}
  onRunComplete(run: TestRun) {}
  onRunError(run: TestRun) {}

  onPhaseStart(phase: Phase, context: PhaseContext) {}
  onPhaseComplete(phase: Phase, context: PhaseContext) {
    this.counters.phases++;
  }
  onPhaseError(phase: Phase, context: PhaseContext) {}

  onScenarioStart(scenario: Scenario, context: ScenarioContext) {}
  onScenarioComplete(scenario: Scenario, context: ScenarioContext) {
    this.counters.scenarios++;
  }
  onScenarioError(scenario: Scenario, context: ScenarioContext) {}

  onRequestComplete(request: RequestActionInfo, scenario: Scenario, context: ScenarioContext) {
    this.counters.requests++;
  }
}
