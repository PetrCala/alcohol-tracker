import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** A BrickRoad indicator mapping */
type BrickRoad = ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;

/** A recursively nested object */
type NestedObject = {
  [key: string]: NestedObject | string | number | boolean | null;
};

/**
 * This function is an equivalent of _.difference, it takes two arrays and returns the difference between them.
 * It returns an array of items that are in the first array but not in the second array.
 */
function arrayDifference<TItem>(array1: TItem[], array2: TItem[]): TItem[] {
  return array1.filter(item => !array2.includes(item));
}

/**
 * Iterates over all the final (non-object) values of a nested object and returns them along with their key paths.
 *
 * @param obj - The nested object to iterate over.
 * @returns An array of objects containing the key path and the corresponding value.
 *
 * Example:
 * ```
 * const nestedObject = {
 *   a: { b: { c: 1, d: 2 }, e: 3 },
 *   f: 4,
 * };
 *
 * const result = iterateNestedObject(nestedObject);
 * console.log(result);
 * // Output:
 * // [
 * //   { keyPath: ['a', 'b', 'c'], value: 1 },
 * //   { keyPath: ['a', 'b', 'd'], value: 2 },
 * //   { keyPath: ['a', 'e'], value: 3 },
 * //   { keyPath: ['f'], value: 4 }
 * // ]
 * ```
 */
function iterateNestedObject<T>(
  object: NestedObject,
): Array<{keyPath: string[]; value: T}> {
  const results: Array<{keyPath: string[]; value: T}> = [];

  /**
   * Helper function to recursively traverse the nested object.
   *
   * @param obj - The current object being traversed.
   * @param keyPath - The current path of keys leading to this object.
   */
  function traverse(obj: NestedObject, keyPath: string[] = []): void {
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = [...keyPath, key];
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        // Recursive call for nested objects
        traverse(value, currentPath);
      } else {
        // Final value, add to results
        results.push({keyPath: currentPath, value: value as T});
      }
    });
  }

  traverse(object);
  return results;
}

export {arrayDifference, iterateNestedObject};
export type {BrickRoad};
