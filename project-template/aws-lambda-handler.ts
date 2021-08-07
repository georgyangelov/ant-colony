import { AWSLambdaExecutor } from 'ant-colony';

import './tests';

// TODO: tsconfig
export const fireAntWorker = AWSLambdaExecutor.lambdaHandler;
