import { InvocationType, InvokeCommand, LambdaClient,  } from "@aws-sdk/client-lambda";
import { ExecutionResult, Executor, ExecutorRunContext } from "../executor";
import { LoadTest } from "../tests";
import { AsyncExecutor } from "./async-executor";

export interface AWSLambdaConfig {
  region: string;
  functionName: string;
}

export interface LambdaPayload {
  testModulePath: string;
  context: ExecutorRunContext;

  phaseName: string;
  task: { type: 'runSingle' } |
        { type: 'runQueued', count: number } |
        { type: 'runQueuedFor', timeMs: number } |
        { type: 'runParallel', count: number };
}

export interface LambdaResult {
  executionResults: ExecutionResult[];
}

// TODO: This should keep track of how many lambdas are active
export class AWSLambdaExecutor implements Executor {
  constructor(
    private testModulePath: string,
    private lambdaConfig: AWSLambdaConfig
  ) {}

  static async lambdaHandler(event: LambdaPayload, context: any): Promise<LambdaResult> {
    const modulePath = event.testModulePath.replace(/\.ts$/, '.js');
    const test = require(modulePath).default as LoadTest;

    const stopIntercepting = test._startInterceptingHTTP();

    try {
      const executor = new AsyncExecutor(test);
      let results: ExecutionResult[];

      const task = event.task;
      switch (task.type) {
        case 'runSingle':
          results = [await executor.runSingle(event.phaseName, event.context)];
          break;

        case 'runQueued':
          results = [await executor.runQueued(event.phaseName, event.context, task.count)];
          break;

        case 'runQueuedFor':
          results = [await executor.runQueuedFor(event.phaseName, event.context, task.timeMs)];
          break;

        case 'runParallel': {
          results = await executor.runParallel(event.phaseName, event.context, task.count);
          break;
        }

        default: throw new Error('Unknown event task type');
      }

      return { executionResults: results };
    } finally {
      stopIntercepting();
    }
  }

  async start(): Promise<void> {}
  async stop(): Promise<void> {}

  // TODO: What happens if there's no available concurrency?
  private async runLambda(input: LambdaPayload): Promise<LambdaResult> {
    const client = new LambdaClient({ region: this.lambdaConfig.region });

    const command = new InvokeCommand({
      FunctionName: this.lambdaConfig.functionName,
      InvocationType: InvocationType.RequestResponse,
      Payload: new TextEncoder().encode(JSON.stringify(input))
    });

    const result = await client.send(command);

    const payload = result.Payload;
    if (!payload) {
      throw new Error('Lambda did not return any payload, something failed');
    }

    const response = JSON.parse(new TextDecoder().decode(payload));

    // TODO: Need to check if response is error or not, it does not raise error

    return response;
  }

  async runSingle(
    phaseName: string,
    context: ExecutorRunContext
  ): Promise<ExecutionResult> {
    const { executionResults } = await this.runLambda({
      context,
      testModulePath: this.testModulePath,
      phaseName,
      task: { type: 'runSingle' }
    });

    return executionResults[0]!;
  }

  async runQueued(
    phaseName: string,
    context: ExecutorRunContext,
    count: number
  ): Promise<ExecutionResult> {
    const { executionResults } = await this.runLambda({
      context,
      testModulePath: this.testModulePath,
      phaseName,
      task: { type: 'runQueued', count }
    });

    return executionResults[0]!;
  }

  async runQueuedFor(
    phaseName: string,
    context: ExecutorRunContext,
    timeMs: number
  ): Promise<ExecutionResult> {
    const { executionResults } = await this.runLambda({
      context,
      testModulePath: this.testModulePath,
      phaseName,
      task: { type: 'runQueuedFor', timeMs }
    });

    return executionResults[0]!;
  }

  // TODO: This should split between multiple lambdas
  async runParallel(
    phaseName: string,
    context: ExecutorRunContext,
    count: number
  ): Promise<ExecutionResult[]> {
    const { executionResults } = await this.runLambda({
      context,
      testModulePath: this.testModulePath,
      phaseName,
      task: { type: 'runParallel', count }
    });

    return executionResults;
  }
}
