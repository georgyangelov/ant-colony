import { groupBy, mapValues, sumBy } from "lodash";
import { RequestActionInfo } from "../actions";
import { Phase, PhaseContext } from "../phases";
import { Reporter } from "../reporter";
import { Scenario, ScenarioContext } from "../scenarios";
import { TestRun } from "../tests";
import { StatsReporter } from "./stats-reporter";
import percentile from 'percentile';

export class ConsoleReporter implements Reporter {
  private statsReporter = new StatsReporter();

  private interval?: NodeJS.Timer;

  onRunStart(run: TestRun) {
    console.log('Load Test Start');

    this.interval = setInterval(() => {
      this.printCurrentPhaseStats(false);
    }, 10 * 1000);

    this.statsReporter.onRunStart(run);
  }
  onRunComplete(run: TestRun) {
    this.statsReporter.onRunComplete(run);

    if (this.interval) {
      clearInterval(this.interval);
    }

    console.log('Load Test Complete');
  }
  onRunError(run: TestRun) {}

  onPhaseStart(phase: Phase, context: PhaseContext) {
    console.log('Phase start', phase.name);

    this.statsReporter.onPhaseStart(phase, context);
  }
  onPhaseComplete(phase: Phase, context: PhaseContext) {
    this.printCurrentPhaseStats(true);

    this.statsReporter.onPhaseComplete(phase, context);

    console.log('\nPhase complete', phase.name);
  }
  onPhaseError(phase: Phase, context: PhaseContext) {}

  onScenarioStart(scenario: Scenario, context: ScenarioContext) {
    this.statsReporter.onScenarioStart(scenario, context);
  }
  onScenarioComplete(scenario: Scenario, context: ScenarioContext) {
    this.statsReporter.onScenarioComplete(scenario, context);
  }
  onScenarioError(scenario: Scenario, context: ScenarioContext) {}

  onRequestComplete(request: RequestActionInfo, scenario: Scenario, context: ScenarioContext) {
    this.statsReporter.onRequestComplete(request, scenario, context);

    process.stdout.write('.');
  }

  private printCurrentPhaseStats(phaseComplete: boolean) {
    const stats = this.statsReporter.currentPhase;
    if (!stats) {
      return;
    }

    const averageTimeMs =
      sumBy(stats.requestTimings, _ => _.responseTime) / stats.requestTimings.length;

    const [p90, p95, p98, p99] = percentile(
      [90, 95, 98, 99],
      stats.requestTimings.map(_ => _.responseTime)
    ) as number[];

    const info = {
      phase: stats.phase.name,
      phaseComplete,

      scenarioCount: stats.scenarioCount,
      requestCount: stats.requestTimings.length,

      responses: mapValues(
        groupBy(stats.requestTimings, _ => _.statusCode),
        _ => _.length
      ),

      responseTimesMs: {
        average: Math.round(averageTimeMs),
        p90, p95, p98, p99
      }
    };

    console.log();
    console.log(info);
  }
}
