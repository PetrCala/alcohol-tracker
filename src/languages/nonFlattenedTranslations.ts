import en from './en';
import cs_cz from './cs_cz';
import type {TranslationBase} from './types';

/**
 * This module simply exports non-flattened translations.
 *
 * It can be used either directly (for full, nested translations)
 * or in the flattening module to produce flattened keys.
 */
const nonFlattenedTranslations: Record<string, TranslationBase> = {
  en,
  cs_cz,
};

export default nonFlattenedTranslations;
