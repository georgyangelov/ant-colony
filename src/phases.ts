import { Reporter } from "./reporter";
import { ScenarioRunResult } from "./scenarios";

export interface Phase {
  name: string;

  run(context: PhaseContext): Promise<PhaseRunResult>;
}

export interface PhaseRunResult {
  phase: Phase;
  scenarioResults: ScenarioRunResult[];
}

export class PhaseContext {
  constructor(public reporter: Reporter) {}
}
