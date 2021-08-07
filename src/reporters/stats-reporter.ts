import { RequestActionInfo } from '../actions';
import { Phase, PhaseContext } from '../phases';
import { Reporter, WorkerReporter } from '../reporter';
import { Scenario, ScenarioContext } from '../scenarios';
import { LoadTest } from '../tests';

export interface PhaseStats extends PhaseWorkerStats {
  phase: Phase;

  startTime: Date;
  endTime: Date;
}

export type PhaseWorkerStats = {
  scenarioCount: number;
  requestTimings: RequestTiming[];
};

export type RequestTiming = [
  /* startedAt */ number,
  /* responseTime */ number,
  /* statusCode */ number | null
];

export class StatsReporter implements Reporter<PhaseWorkerStats> {
  stats: PhaseStats[] = [];
  currentPhase!: Omit<PhaseStats, 'endTime'>;

  onRunStart(run: LoadTest) {}
  onRunComplete(run: LoadTest) {}
  onRunError(run: LoadTest) {}

  onPhaseStart(phase: Phase, context: PhaseContext) {
    this.currentPhase = {
      phase,
      startTime: new Date(),
      scenarioCount: 0,
      requestTimings: []
    };
  }
  onPhaseComplete(phase: Phase, context: PhaseContext) {
    this.stats.push({
      ...this.currentPhase,

      endTime: new Date()
    });
  }
  onPhaseError(phase: Phase, context: PhaseContext) {}

  workerReporterFor(test: LoadTest, phase: Phase) {
    return new StatsWorkerReporter();
  }

  onDataFromWorker(data: PhaseWorkerStats): void | Promise<void> {
    this.currentPhase.scenarioCount += data.scenarioCount;

    data.requestTimings.forEach(timing => {
      this.currentPhase.requestTimings.push(timing);
    });
  }
}

export class StatsWorkerReporter implements WorkerReporter<PhaseWorkerStats> {
  private stats: PhaseWorkerStats = {
    requestTimings: [],
    scenarioCount: 0
  };

  init() {}
  complete() {
    return this.stats;
  }

  onScenarioStart(scenario: Scenario, context: ScenarioContext) {
    this.stats.scenarioCount++;
  }
  onScenarioComplete(scenario: Scenario, context: ScenarioContext) {}
  onScenarioError(scenario: Scenario, context: ScenarioContext) {}

  onRequestComplete(
    request: RequestActionInfo,
    scenario: Scenario,
    context: ScenarioContext
  ) {
    this.stats.requestTimings.push([
      request.startedAtUnixMs,
      request.responseTimeMs,
      request.statusCode ?? null
    ]);
  }
}
