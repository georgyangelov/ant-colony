#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import path from 'path';
import { AsyncExecutor } from '../executors/async-executor';
import { AWSLambdaExecutor } from '../executors/aws-lambda-executor';
import { LoadTest } from "../tests";

try {
  require('ts-node/register');
} catch {}

const program = new Command();

program
  .command('run <test-file-path>')
  // .option('--workers')
  .description('Run a test script')
  .action(async (testFilePath) => {
    const absolutePath = path.resolve(process.cwd(), testFilePath);
    const testRun = require(absolutePath).default as LoadTest;

    await testRun.execute(new AsyncExecutor(testRun));
    // await testRun.execute(new WorkerThreadExecutor(absolutePath, 10));
  });

program
  .command('run-serverless <test-file-path>')
  .description('Run the test script in AWS Lambda')
  .action(async (testFilePath) => {
    // TODO: Checks and error handling
    const serverlessStateFile = path.resolve(process.cwd(), '.serverless/serverless-state.json');
    const serverlessState = JSON.parse(
      readFileSync(serverlessStateFile, { encoding: 'utf-8' })
    );

    const lambdaConfig = {
      region: serverlessState.service.provider.region as string,
      functionName: serverlessState.service.functions.fireAntWorker.name as string
    };

    const absolutePath = path.resolve(process.cwd(), testFilePath);
    const testRun = require(absolutePath).default as LoadTest;

    await testRun.execute(new AWSLambdaExecutor(testFilePath, lambdaConfig));
  });

program.parse();
