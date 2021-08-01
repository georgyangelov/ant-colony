import { expose } from "threads";
import { workerData } from "worker_threads";
import { WorkerData, newWorkerThread } from "../executors/worker-thread-executor";
import { TestRun } from "../tests";

const data: WorkerData = workerData;

const test = require(data.testModulePath).default as TestRun;

test._startInterceptingHTTP();

expose(newWorkerThread(test));
