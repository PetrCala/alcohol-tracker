import CONST from '@src/CONST';

// Perhaps if this grows too largs, rewrite into a module export
export const shouldRunTests = process.env.APP_ENVIRONMENT === CONST.ENVIRONMENT.TEST;
export const describeWithEmulator = shouldRunTests ? describe : describe.skip;
