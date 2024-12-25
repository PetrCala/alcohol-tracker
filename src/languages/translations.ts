import nonFlattenedTranslations from './nonFlattenedTranslations';
import type {TranslationBase, TranslationFlatObject} from './types';

/**
 * Converts an object to its flattened version.
 *
 * Ex:
 * Input: { common: { yes: "Yes", no: "No" }}
 * Output: { "common.yes": "Yes", "common.no": "No" }
 */
// Necessary to export so that it is accessible to the unit tests
// eslint-disable-next-line rulesdir/no-inline-named-export
export function flattenObject(obj: TranslationBase): TranslationFlatObject {
  const result: Record<string, unknown> = {};

  const recursive = (data: TranslationBase, key: string): void => {
    // If the data is a function or not an object (string, array), just set the value directly.
    if (
      typeof data === 'function' ||
      Array.isArray(data) ||
      !(typeof data === 'object' && !!data)
    ) {
      result[key] = data;
    } else {
      let isEmpty = true;
      Object.keys(data).forEach(k => {
        isEmpty = false;
        recursive(data[k] as TranslationBase, key ? `${key}.${k}` : k);
      });

      // If the object is empty but a key exists, default to an empty string
      if (isEmpty && key) {
        result[key] = '';
      }
    }
  };

  recursive(obj, '');
  return result as TranslationFlatObject;
}

export default {
  en: flattenObject(nonFlattenedTranslations.en),
  cs_cz: flattenObject(nonFlattenedTranslations.cs_cz),
};
