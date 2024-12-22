import type {TupleToUnion, ValueOf} from 'type-fest';
import CONST from '@src/CONST';

function getLanguageFromLocale(
  locale: ValueOf<typeof CONST.LOCALES>,
): TupleToUnion<typeof CONST.LANGUAGES> {
  switch (locale) {
    case CONST.LOCALES.CS_CZ:
      return CONST.LOCALES.CS_CZ;
    case CONST.LOCALES.EN:
      return CONST.LOCALES.EN;
    default:
      return CONST.LOCALES.DEFAULT;
  }
}

export default {getLanguageFromLocale};
