import { RequestActionInfo } from "../actions";
import { Phase, PhaseContext } from "../phases";
import { Reporter, WorkerReporter } from "../reporter";
import { Scenario, ScenarioContext } from "../scenarios";
import { TestRun } from "../tests";

// [
//   Reporter<string>,
//   Reporter<number>
// ]
//
// ->
//
// Reporter<[string, number]>

// type DataTypeOfReporter<W> = W extends Reporter<infer R> ? R : never;
// type ToWorkerReporter<ReporterT> = WorkerReporter<DataTypeOfReporter<ReporterT>>;

export class UnionReporter implements Reporter<any> {
  constructor(private reporters: Reporter<any>[]) {}

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

  workerReporterFor(test: TestRun, phase: Phase) {
    return new UnionWorkerReporter(this.reporters.map(_ => _.workerReporterFor(test, phase)));
  }

  async onDataFromWorker(data: any) {
    await Promise.all(
      this.reporters.map((reporter, i) =>
        reporter.onDataFromWorker(data[i])
      )
    );
  }
}

class UnionWorkerReporter implements WorkerReporter<any> {
  constructor(private reporters: WorkerReporter<any>[]) {}

  async init() {
    await Promise.all(this.reporters.map(reporter => reporter.init()));
  }

  async complete() {
    return Promise.all(this.reporters.map(reporter => reporter.complete())) as any;
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
