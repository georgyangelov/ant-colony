import { groupBy, mapValues, sumBy } from 'lodash';
import { RequestActionInfo } from '../actions';
import { Phase, PhaseContext } from '../phases';
import { Reporter, WorkerReporter } from '../reporter';
import { Scenario, ScenarioContext } from '../scenarios';
import { LoadTest } from '../tests';
import {
  PhaseWorkerStats,
  StatsReporter,
  StatsWorkerReporter
} from './stats-reporter';
import percentile from 'percentile';

export class ConsoleReporter implements Reporter<PhaseWorkerStats> {
  private statsReporter = new StatsReporter();

  onRunStart(run: LoadTest) {
    console.log('Load Test Start');

    this.statsReporter.onRunStart(run);
  }
  onRunComplete(run: LoadTest) {
    this.statsReporter.onRunComplete(run);

    console.log('Load Test Complete');
  }
  onRunError(run: LoadTest) {}

  onPhaseStart(phase: Phase, context: PhaseContext) {
    console.log('Phase start', phase.name);

    this.statsReporter.onPhaseStart(phase, context);
  }
  onPhaseComplete(phase: Phase, context: PhaseContext) {
    this.printCurrentPhaseStats();
    console.log('Phase complete', phase.name);

    this.statsReporter.onPhaseComplete(phase, context);
  }
  onPhaseError(phase: Phase, context: PhaseContext) {}

  workerReporterFor(test: LoadTest, phase: Phase) {
    const statsWorkerReporter = this.statsReporter.workerReporterFor(
      test,
      phase
    );

    return new ConsoleWorkerReporter(statsWorkerReporter);
  }

  onDataFromWorker(data: PhaseWorkerStats) {
    return this.statsReporter.onDataFromWorker(data);
  }

  private printCurrentPhaseStats() {
    const stats = this.statsReporter.currentPhase;
    if (!stats) {
      return;
    }

    const averageTimeMs =
      sumBy(stats.requestTimings, _ => _[1]) / stats.requestTimings.length;

    const [p90, p95, p98, p99, max] = percentile(
      [90, 95, 98, 99, 100],
      stats.requestTimings.map(_ => _[1])
    ) as number[];

    const info = {
      phase: stats.phase.name,

      scenarioCount: stats.scenarioCount,
      requestCount: stats.requestTimings.length,

      responses: mapValues(
        groupBy(stats.requestTimings, _ => _[2]),
        _ => _.length
      ),

      responseTimesMs: {
        average: Math.round(averageTimeMs),
        p90,
        p95,
        p98,
        p99,
        max
      }
    };

    console.log();
    console.log(info);
  }
}

class ConsoleWorkerReporter implements WorkerReporter<PhaseWorkerStats> {
  constructor(private statsWorker: StatsWorkerReporter) {}

  init() {
    return this.statsWorker.init();
  }
  complete() {
    return this.statsWorker.complete();
  }

  onScenarioStart(scenario: Scenario, context: ScenarioContext) {
    this.statsWorker.onScenarioStart(scenario, context);
  }
  onScenarioComplete(scenario: Scenario, context: ScenarioContext) {
    this.statsWorker.onScenarioComplete(scenario, context);
  }
  onScenarioError(scenario: Scenario, context: ScenarioContext) {
    this.statsWorker.onScenarioError(scenario, context);
  }

  onRequestComplete(
    request: RequestActionInfo,
    scenario: Scenario,
    context: ScenarioContext
  ) {
    this.statsWorker.onRequestComplete(request, scenario, context);

    process.stdout.write('.');
  }
}
