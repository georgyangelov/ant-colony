import { Command } from 'commander';
import path from 'path';
import { AsyncExecutor } from '../executors/async-executor';
import { WorkerThreadExecutor } from '../executors/worker-thread-executor';
import { TestRun } from "../tests";

const program = new Command();

program
  .command('run <test-file-path>')
  // .option('--workers')
  .description('Run a test script')
  .action(async (testFilePath) => {
    const absolutePath = path.resolve(process.cwd(), testFilePath);
    const testRun = require(absolutePath).default as TestRun;

    // await testRun.execute(new AsyncExecutor());
    await testRun.execute(new WorkerThreadExecutor(absolutePath, 10));
  });

program.parse();
