import { sleep } from "./lib/sleep";
import { Scenario, ScenarioContext } from "./scenarios";

export interface RequestActionInfo {
  url: string;
  totalTime: number;
}

export class Actions {
  constructor(private scenario: Scenario, private context: ScenarioContext) {}

  // TODO: Cancel actual HTTP requests, not just between them
  async fetch(url: string) {
    // if (this.context.shouldCancel) {
    //   throw new CancelError();
    // }

    await sleep(666);

    this.context.reporter.onRequestComplete(
      { url, totalTime: 666 },
      this.scenario,
      this.context
    );
  }
}
