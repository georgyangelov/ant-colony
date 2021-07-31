import { RequestActionInfo } from "../actions";
import { Phase, PhaseContext } from "../phases";
import { Reporter } from "../reporter";
import { Scenario, ScenarioContext } from "../scenarios";
import { TestRun } from "../tests";

export class UnionReporter implements Reporter {
  constructor(private reporters: Reporter[]) {}

  async onRunStart(run: TestRun) {
    await Promise.all(this.reporters.map(reporter => reporter.onRunStart(run)));
  }
  async onRunComplete(run: TestRun) {
    await Promise.all(this.reporters.map(reporter => reporter.onRunComplete(run)));
  }
  async onRunError(run: TestRun) {
    await Promise.all(this.reporters.map(reporter => reporter.onRunError(run)));
  }

  async onPhaseStart(phase: Phase, context: PhaseContext) {
    await Promise.all(this.reporters.map(reporter => reporter.onPhaseStart(phase, context)));
  }
  async onPhaseComplete(phase: Phase, context: PhaseContext) {
    await Promise.all(this.reporters.map(reporter => reporter.onPhaseComplete(phase, context)));
  }
  async onPhaseError(phase: Phase, context: PhaseContext) {
    await Promise.all(this.reporters.map(reporter => reporter.onPhaseError(phase, context)));
  }

  onScenarioStart(scenario: Scenario, context: ScenarioContext) {
    this.reporters.forEach(reporter => reporter.onScenarioStart(scenario, context));
  }
  onScenarioComplete(scenario: Scenario, context: ScenarioContext) {
    this.reporters.forEach(reporter => reporter.onScenarioComplete(scenario, context));
  }
  onScenarioError(scenario: Scenario, context: ScenarioContext) {
    this.reporters.forEach(reporter => reporter.onScenarioError(scenario, context));
  }

  onRequestComplete(request: RequestActionInfo, scenario: Scenario, context: ScenarioContext) {
    this.reporters.forEach(reporter => reporter.onRequestComplete(request, scenario, context));
  }
}
