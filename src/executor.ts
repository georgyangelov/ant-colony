import { BaseWorkerData } from "./reporter";

export interface ExecutorRunContext {}

export interface ExecutionResult {
  reporterData: BaseWorkerData;
}

export interface Executor {
  start(): Promise<void>;
  stop(): Promise<void>;

  // ensureCapacityForParallelScenarios(count: number): Promise<void>;

  runSingle(
    phaseName: string,
    context: ExecutorRunContext
  ): Promise<ExecutionResult>;

  runQueued(
    phaseName: string,
    context: ExecutorRunContext,
    numberOfRequestsPerQueue: number,
    numberOfQueues: number
  ): Promise<ExecutionResult[]>;

  runQueuedFor(
    phaseName: string,
    context: ExecutorRunContext,
    timeMs: number,
    numberOfQueues: number
  ): Promise<ExecutionResult[]>;

  // TODO: Is this actually needed? Isn't this equivalent to runQueued with
  //       numberOfRequestsPerQueue = 1? Or is there an optimization to be made?
  runParallel(
    phaseName: string,
    context: ExecutorRunContext,
    count: number
  ): Promise<ExecutionResult[]>;
}
