import { RequestActionInfo } from './actions';
import { Phase, PhaseContext } from './phases';
import { Scenario, ScenarioContext } from './scenarios';
import { LoadTest } from './tests';

type JSONValue = string | boolean | null | number;
type JSONArray = (JSONValue | JSONArray | JSONObject)[];
interface JSONObject {
  [k: string]: JSONValue | JSONObject | JSONArray;
}

export type BaseWorkerData = JSONValue | JSONArray | JSONObject;

export interface Reporter<WorkerDataT extends BaseWorkerData> {
  onRunStart(run: LoadTest): void | Promise<void>;
  onRunComplete(run: LoadTest): void | Promise<void>;
  onRunError(run: LoadTest): void | Promise<void>;

  onPhaseStart(phase: Phase, context: PhaseContext): void | Promise<void>;
  onPhaseComplete(phase: Phase, context: PhaseContext): void | Promise<void>;

  workerReporterFor(test: LoadTest, phase: Phase): WorkerReporter<WorkerDataT>;
  onDataFromWorker(data: WorkerDataT): void | Promise<void>;
}

export interface WorkerReporter<WorkerDataT extends BaseWorkerData> {
  init(): void | Promise<void>;
  complete(): WorkerDataT | Promise<WorkerDataT>;

  onScenarioStart(scenario: Scenario, context: ScenarioContext): void;
  onScenarioComplete(scenario: Scenario, context: ScenarioContext): void;
  onScenarioError(scenario: Scenario, context: ScenarioContext): void;

  onRequestComplete(request: RequestActionInfo, scenario: Scenario, context: ScenarioContext): void;
}
