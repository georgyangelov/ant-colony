import { RequestActionInfo } from "./actions";
import { Phase, PhaseContext } from "./phases";
import { Scenario, ScenarioContext } from "./scenarios";
import { TestRun } from "./tests";

export interface Reporter {
  onRunStart(run: TestRun): void;
  onRunComplete(run: TestRun): void;
  onRunError(run: TestRun): void;

  onPhaseStart(phase: Phase, context: PhaseContext): void;
  onPhaseComplete(phase: Phase, context: PhaseContext): void;
  onPhaseError(phase: Phase, context: PhaseContext): void;

  onScenarioStart(scenario: Scenario, context: ScenarioContext): void;
  onScenarioComplete(scenario: Scenario, context: ScenarioContext): void;
  onScenarioError(scenario: Scenario, context: ScenarioContext): void;

  onRequestComplete(request: RequestActionInfo, scenario: Scenario, context: ScenarioContext): void;
}
