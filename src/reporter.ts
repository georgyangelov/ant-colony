import { RequestActionInfo } from "./actions";
import { Phase, PhaseContext } from "./phases";
import { Scenario, ScenarioContext } from "./scenarios";
import { TestRun } from "./tests";

export interface Reporter {
  onRunStart(run: TestRun): void | Promise<void>;
  onRunComplete(run: TestRun): void | Promise<void>;
  onRunError(run: TestRun): void | Promise<void>;

  onPhaseStart(phase: Phase, context: PhaseContext): void | Promise<void>;
  onPhaseComplete(phase: Phase, context: PhaseContext): void | Promise<void>;
  onPhaseError(phase: Phase, context: PhaseContext): void | Promise<void>;

  onScenarioStart(scenario: Scenario, context: ScenarioContext): void;
  onScenarioComplete(scenario: Scenario, context: ScenarioContext): void;
  onScenarioError(scenario: Scenario, context: ScenarioContext): void;

  onRequestComplete(request: RequestActionInfo, scenario: Scenario, context: ScenarioContext): void;
}
