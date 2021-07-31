import { Reporter } from "../reporter";

export class VoidReporter implements Reporter {
  onRunStart() {}
  onRunComplete() {}
  onRunError() {}

  onPhaseStart() {}
  onPhaseComplete() {}
  onPhaseError() {}

  onScenarioStart() {}
  onScenarioComplete() {}
  onScenarioError() {}

  onRequestComplete() {}
}
