import { Phase, PhaseContext } from "../phases";
import { Reporter, WorkerReporter } from "../reporter";
import { LoadTest } from "../tests";

type Counters = {
  phases: 0,
  scenarios: 0,
  requests: 0
};

export class CountingReporter implements Reporter<Counters> {
  counters: Counters = {
    phases: 0,
    scenarios: 0,
    requests: 0
  };

  onRunStart(run: LoadTest) {}
  onRunComplete(run: LoadTest) {}
  onRunError(run: LoadTest) {}

  onPhaseStart(phase: Phase, context: PhaseContext) {}
  onPhaseComplete(phase: Phase, context: PhaseContext) {
    this.counters.phases++;
  }
  onPhaseError(phase: Phase, context: PhaseContext) {}

  workerReporterFor(test: LoadTest, phase: Phase) {
    return new CountingWorkerReporter();
  }

  onDataFromWorker(data: Counters) {
    this.counters.phases += data.phases;
    this.counters.scenarios += data.scenarios;
    this.counters.requests += data.requests;
  }
}

class CountingWorkerReporter implements WorkerReporter<Counters> {
  private counters: Counters = {
    phases: 0,
    scenarios: 0,
    requests: 0
  };

  init() {}
  complete() {
    return this.counters;
  }

  onScenarioStart() {
    this.counters.scenarios++;
  }
  onScenarioComplete() {}
  onScenarioError() {}

  onRequestComplete() {
    this.counters.requests++;
  }
}

