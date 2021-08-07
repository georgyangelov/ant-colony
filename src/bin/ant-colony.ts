#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import path from 'path';
import { AsyncExecutor } from '../executors/async-executor';
import {
  AWSLambdaConfig,
  AWSLambdaExecutor
} from '../executors/aws-lambda-executor';
import { WorkerThreadExecutor } from '../executors/worker-thread-executor';
import { ProjectGenerator } from '../project-generator/project-generator';
import { LoadTest } from '../tests';

const program = new Command();

program
  .command('init <directory-path>')
  .description('Generate a new project')
  .action(destinationDir => {
    const generator = new ProjectGenerator({
      templateDir: path.resolve(__dirname, '../../project-template'),
      destinationDir,
      parameters: {
        antColonyVersion: readPackageVersion()
      }
    });

    generator.generate();
  });

program
  .command('run <test-file-path>')
  // .option('--workers')
  .description('Run a test script')
  .action(async testFilePath => {
    const loadTest = requireLoadTest(testFilePath);

    await loadTest.execute(new AsyncExecutor(loadTest));
    // await loadTest.execute(new WorkerThreadExecutor(absolutePath, 10));
  });

program
  .command('run-serverless <test-file-path>')
  .description('Run the test script in AWS Lambda')
  .action(async testFilePath => {
    // TODO: Checks and error handling
    const serverlessStateFile = path.resolve(
      process.cwd(),
      '.serverless/serverless-state.json'
    );
    const serverlessState = JSON.parse(
      readFileSync(serverlessStateFile, { encoding: 'utf-8' })
    );

    const lambdaConfig: AWSLambdaConfig = {
      region: serverlessState.service.provider.region as string,
      functionName: serverlessState.service.functions.fireAntWorker
        .name as string,

      // TODO: Make this a config parameter
      maxConcurrentScenariosPerFunction: 10
    };

    const loadTest = requireLoadTest(testFilePath);

    await loadTest.execute(new AWSLambdaExecutor(testFilePath, lambdaConfig));
  });

function requireLoadTest(testFilePath: string) {
  if (testFilePath.endsWith('.ts')) {
    const isRunningInTSNode = !!(process as any)[
      Symbol.for('ts-node.register.instance')
    ];

    if (!isRunningInTSNode) {
      try {
        require('ts-node/register');
      } catch {
        throw new Error(
          'Tried to load a `.ts` test file, but not running in ts-node and ' +
            'could not require ts-node/register. Please make sure `ts-node` is installed'
        );
      }
    }
  }

  const absolutePath = path.resolve(process.cwd(), testFilePath);

  // TODO: Check file exists

  return require(absolutePath).default as LoadTest;
}

program.parse();

function readPackageVersion() {
  const packagePath = path.resolve(__dirname, '../../package.json');

  return JSON.parse(readFileSync(packagePath, { encoding: 'utf-8' }))[
    'version'
  ] as string;
}
