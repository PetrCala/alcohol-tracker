require('dotenv').config(); // for the process.env variables to read the .env file
import CONST from '@src/CONST';

// Perhaps if this grows too largs, rewrite into a module export
export const shouldRunTests =
  process.env.APP_ENVIRONMENT === CONST.ENVIRONMENT.TEST;
export const describeWithEmulator = shouldRunTests ? describe : describe.skip;
