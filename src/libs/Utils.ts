import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {OnyxMergeInput} from 'react-native-onyx';
import Onyx, {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

type BrickRoad = ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;

type NestedObject = {[key: string]: any};

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Checks if two objects are equal by comparing their keys and values.
 * DEPRECATED: Use lodash.isEqual instead.
 * @param obj1 - The first object to compare.
 * @param obj2 - The second object to compare.
 * @returns True if the objects are equal, false otherwise.
 */
function objectsAreEqual(obj1: any, obj2: any): boolean {
  if (!isObject(obj1) || !isObject(obj2)) {
    return false;
  }

  const obj1Keys = Object.keys(obj1).sort();
  const obj2Keys = Object.keys(obj2).sort();

  // Check if both objects have the same number of keys
  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  // Check if all keys in obj1 exist in obj2 and have the same values
  for (const key of obj1Keys) {
    if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

function arrayItemsAreEqual<T>(arr1: T[], arr2: T[]): boolean {
  // Sort both arrays
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();

  // Check if the arrays are the same length
  if (sortedArr1.length !== sortedArr2.length) {
    return false;
  }

  // Check if all elements are equal
  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false;
    }
  }

  return true;
}

/**
 * This function is an equivalent of _.difference, it takes two arrays and returns the difference between them.
 * It returns an array of items that are in the first array but not in the second array.
 */
function arrayDifference<TItem>(array1: TItem[], array2: TItem[]): TItem[] {
  return [array1, array2].reduce((a, b) => a.filter(c => !b.includes(c)));
}

/**
Iterates over all the final (non-object) values of a nested object and returns them along with their key paths.

@param obj - The nested object to iterate over.
@returns An array of objects containing the key path and the corresponding value.

Example:
```
const nestedObject = {
  a: { b: { c: 1, d: 2 }, e: 3 },
  f: 4,
};

const result = iterateNestedObject(nestedObject);
console.log(result);
// Output:
// [
//   { keyPath: ['a', 'b', 'c'], value: 1 },
//   { keyPath: ['a', 'b', 'd'], value: 2 },
//   { keyPath: ['a', 'e'], value: 3 },
//   { keyPath: ['f'], value: 4 }
// ]
```
 */
function iterateNestedObject<T>(
  obj: NestedObject,
): {keyPath: string[]; value: T}[] {
  const results: {keyPath: string[]; value: T}[] = [];

  /**
Helper function to recursively traverse the nested object.
@param obj - The current object being traversed.
@param keyPath - The current path of keys leading to this object.
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
        results.push({keyPath: currentPath, value});
      }
    });
  }

  traverse(obj);
  return results;
}

async function setLoadingText(
  text: OnyxMergeInput<'appLoadingText'>,
): Promise<void> {
  await Onyx.merge(ONYXKEYS.APP_LOADING_TEXT, text);
}

export {
  arrayDifference,
  arrayItemsAreEqual,
  isObject,
  iterateNestedObject,
  objectsAreEqual,
  setLoadingText,
};
export type {BrickRoad};
