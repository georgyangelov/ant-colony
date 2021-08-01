import { Phase } from "../phases";
import { Reporter, WorkerReporter } from "../reporter";
import { TestRun } from "../tests";

export class VoidReporter implements Reporter<null> {
  onRunStart() {}
  onRunComplete() {}
  onRunError() {}

  onPhaseStart() {}
  onPhaseComplete() {}

  workerReporterFor(test: TestRun, phase: Phase) {
    return new VoidWorkerReporter();
  }

  onDataFromWorker() {}
}

class VoidWorkerReporter implements WorkerReporter<null> {
  init() {}
  complete() {
    return null;
  }

  onScenarioStart() {}
  onScenarioComplete() {}
  onScenarioError() {}

  onRequestComplete() {}
}
