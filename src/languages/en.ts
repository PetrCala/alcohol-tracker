import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type {TranslationBase} from './types';

type AllCountries = Record<Country, string>;

/* eslint-disable max-len */
export default {
  common: {
    cancel: 'Cancel',
    //...
  },
} satisfies TranslationBase;
