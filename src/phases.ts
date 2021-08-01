import { Executor } from "./executor";
import { Reporter } from "./reporter";
import { IScenario } from "./scenarios";

export interface Phase {
  name: string;
  scenario: IScenario;

  run(context: PhaseContext): Promise<PhaseRunResult>;
}

export interface PhaseRunResult {
  phase: Phase;
}

export class PhaseContext {
  constructor(
    public executor: Executor,
    public reporter: Reporter<any>
  ) {}
}
