import { Executor } from "./executor";
import { Reporter } from "./reporter";
import { Scenario } from "./scenarios";

export interface Phase {
  name: string;
  scenario: Scenario;

  run(context: PhaseContext): Promise<PhaseRunResult>;
}

export interface PhaseRunResult {
  phase: Phase;
  // scenarioResults: ScenarioRunResult[];
}

export class PhaseContext {
  constructor(
    public executor: Executor,
    public reporter: Reporter<any>
  ) {}
}
