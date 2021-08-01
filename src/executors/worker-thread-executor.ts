import { flatten, times } from 'lodash';
import { ModuleThread, Pool, spawn, Worker } from 'threads';
import { ExecutionResult, Executor, ExecutorRunContext } from "../executor";
import { TestRun } from "../tests";
import { AsyncExecutor } from "./async-executor";

export interface WorkerData {
  testModulePath: string;
}

export function newWorkerThread(test: TestRun) {
  const asyncExecutor = new AsyncExecutor(test);

  return {
    runSingle: asyncExecutor.runSingle.bind(asyncExecutor),
    runQueued: asyncExecutor.runQueued.bind(asyncExecutor),
    runQueuedUntil: asyncExecutor.runQueuedUntil.bind(asyncExecutor),
    runParallel: asyncExecutor.runParallel.bind(asyncExecutor),
  };
}

export type WorkerThread = ReturnType<typeof newWorkerThread>;

export class WorkerThreadExecutor implements Executor {
  private pool?: Pool<ModuleThread<WorkerThread>>;

  constructor(
    private testModulePath: string,
    private workerCount: number,
  ) {}

  async start(): Promise<void> {
    this.pool = Pool(() => {
      const data: WorkerData = {
        testModulePath: this.testModulePath
      };

      const worker = new Worker(
        '../bin/worker.ts',
        { workerData: data }
      );

      return spawn(worker);
    }, {
      size: this.workerCount,
      concurrency: 10_000,
      name: 'WorkerThreadExecutor'
    });

    await this.pool.settled(true);
  }

  async stop(): Promise<void> {
    await this.pool?.terminate();
  }

  async runSingle(
    phaseName: string,
    context: ExecutorRunContext
  ): Promise<ExecutionResult> {
    return this.pool!.queue(thread => thread.runSingle(phaseName, context));
  }

  async runQueued(
    phaseName: string,
    context: ExecutorRunContext,
    count: number
  ): Promise<ExecutionResult> {
    return this.pool!.queue(thread => thread.runQueued(phaseName, context, count));
  }

  async runQueuedUntil(
    phaseName: string,
    context: ExecutorRunContext,
    unixTimeMs: number
  ): Promise<ExecutionResult> {
    return this.pool!.queue(thread => thread.runQueuedUntil(phaseName, context, unixTimeMs));
  }

  async runParallel(
    phaseName: string,
    context: ExecutorRunContext,
    count: number
  ): Promise<ExecutionResult[]> {
    const countPerWorker = count / this.workerCount;
    const jobs = [
      ...times(this.workerCount - 1, () => countPerWorker),
      count - (this.workerCount - 1) * countPerWorker
    ];

    const results = await Promise.all(jobs.map(count =>
      this.pool!.queue(thread => thread.runParallel(phaseName, context, count))
    ));

    return flatten(results);
  }
}
