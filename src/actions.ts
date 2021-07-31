import { Scenario, ScenarioContext } from "./scenarios";
import fetch from 'node-fetch';

export interface RequestActionInfo {
  url: string;
  statusCode: number | undefined;

  startedAtUnixMs: number;
  responseTimeMs: number;
}

export class Actions {
  constructor(private scenario: Scenario, private context: ScenarioContext) {}

  // TODO: Cancel actual HTTP requests, not just between them
  async fetch(url: string) {
    // if (this.context.shouldCancel) {
    //   throw new CancelError();
    // }

    await fetch(url);

    // await sleep(666);

    // TODO: Make sure this ignores the node interceptor
    // this.context.reporter.onRequestComplete(
    //   { url, statusCode: 404, responseTimeMs: 666 },
    //   this.scenario,
    //   this.context
    // );
  }
}
