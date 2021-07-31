import { Actions } from "./actions";
import { Phase } from "./phases";
import { Reporter } from "./reporter";

export class ScenarioContext {
  constructor(
    public phase: Phase,
    public reporter: Reporter
  ) {}
}

export interface ScenarioRunResult {
  scenario: Scenario;
}

export class Scenario {
  constructor(
    public name: string,
    private runFn: (actions: Actions) => Promise<void>
  ) {}

  async run(context: ScenarioContext): Promise<ScenarioRunResult> {
    context.reporter.onScenarioStart(this, context);

    const actions = new Actions(this, context);

    try {
      await this.runFn(actions);
    } finally {
      context.reporter.onScenarioComplete(this, context);
    }

    return { scenario: this };
  }
}
