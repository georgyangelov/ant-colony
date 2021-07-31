import { timed } from "./lib/timed";
import { Phase, PhaseContext, PhaseRunResult } from "./phases";
import { Reporter } from "./reporter";

export interface TestRunFlow {
  reporter: Reporter;

  phases: Phase[];
}

export interface TestRunResult {
  totalTimeSeconds: number;

  phaseResults: PhaseRunResult[];
}

export class TestRun {
  constructor(private config: TestRunFlow) {}

  async execute(): Promise<TestRunResult> {
    const phaseResults: PhaseRunResult[] = [];

    const [, totalTimeMs] = await timed(async () => {
      for (const phase of this.config.phases) {
        const phaseContext = new PhaseContext(this.config.reporter);

        const result = await phase.run(phaseContext);

        phaseResults.push(result);
      }
    });

    return {
      totalTimeSeconds: totalTimeMs / 1000,
      phaseResults,
    };
  }
}
