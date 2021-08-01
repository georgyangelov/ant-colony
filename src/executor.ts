import { BaseWorkerData } from "./reporter";

export interface ExecutorRunContext {}

export interface ExecutionResult {
  reporterData: BaseWorkerData;
}

export interface Executor {
  start(): Promise<void>;
  stop(): Promise<void>;

  runSingle(
    phaseName: string,
    context: ExecutorRunContext
  ): Promise<ExecutionResult>;

  runQueued(
    phaseName: string,
    context: ExecutorRunContext,
    count: number
  ): Promise<ExecutionResult>;

  runQueuedUntil(
    phaseName: string,
    context: ExecutorRunContext,
    unixTimeMs: number
  ): Promise<ExecutionResult>;

  runParallel(
    phaseName: string,
    context: ExecutorRunContext,
    count: number
  ): Promise<ExecutionResult[]>;
}
