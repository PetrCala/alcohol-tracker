// Taken and modified form the Expensify GitHub
// Source: https://github.com/Expensify/App/blob/main/src/CONST.ts

// import Config from 'react-native-config';

// Creating a default array and object this way because objects ({}) and arrays ([]) are not stable types.
// Freezing the array ensures that it cannot be unintentionally modified.
const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});

const CONST = {
  ENVIRONMENT: {
    DEV: 'development',
    STAGING: 'staging',
    PROD: 'production',
    TEST: 'test',
  },
  EMPTY_ARRAY,
  EMPTY_OBJECT,
} as const;

export default CONST;
