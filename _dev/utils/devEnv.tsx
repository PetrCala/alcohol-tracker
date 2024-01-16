require('dotenv').config(); // for the process.env variables to read the .env file
import CONST from '../../src/CONST';

const environment = process.env.APP_ENVIRONMENT; // From .env, could be null
if (!environment) {
  throw new Error('APP_ENVIRONMENT not set in .env file');
}

// Perhaps export the environment too if necessary

export const isProdEnv = environment === CONST.ENVIRONMENT.PROD;
