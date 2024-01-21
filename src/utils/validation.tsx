import semver, { minSatisfying } from 'semver';
import {Platform} from 'react-native';
import CONST from '@src/CONST';

import {version as _version} from '../../package.json';

const version: string = _version;

type ValidationResult = {
  success: boolean;
  message?: string;
};

/**
 * Check that the current platform is valid.
 */
export const platformIsValid = (): boolean => {
  return CONST.AVAILABLE_PLATFORMS.includes(Platform.OS as any);
};

/**
 * Validate that a string does not contain any characters not accepted
 * as keys by the Realtime Firebase.
 *
 * @param {string} input Input string to check.
 * @returns {boolean} True if the string is valid, false otherwise.
 */
export function isValidString(input: string) {
  for (const char of CONST.INVALID_CHARS) {
    if (input.includes(char)) {
      return false;
    }
  }
  return true;
}

/**
 * Having a list of input sign in text, check that all fields are valid. Return the
 * results as a ValidationResult object.
 *
 * @param {string} email User mail
 * @param {string} username User name
 * @param {string} password User password
 * @param {string} betaKey Beta key // Beta feature
 */
export const validateSignInInput = (
  email: string,
  username: string,
  password: string,
  betaKey: string, // Beta feature
): ValidationResult => {
  if (email == '' || username == '' || password == '' || betaKey == '') {
    // Beta feature
    return {success: false, message: 'You must fill out all fields first'};
  }
  if (!isValidString(username)) {
    return {
      success: false,
      message:
        'Your nickname can not contain ' + CONST.INVALID_CHARS.join(', '),
    };
  }
  return {success: true};
};

/** Input the minimum supported version of the application and validate that the current version is not older than that one. If it is newer, return true, otherwise return false.
 *
 * @param minSupportedVersion Version to validate against.
 * @param currentAppVersion Current version of the application. Defaults to the version stored in 'package.json'. Overwrite this value only in testing.
 * @returns {ValidationResult} Validation result type object.
 */
export const validateAppVersion = (
  minSupportedVersion: string | undefined,
  currentAppVersion: string = version,
): ValidationResult => {
  console.log(minSupportedVersion)
  if (!minSupportedVersion)
    // Allowing to be null allows cleaner code down the line
    return {
      success: false,
      message:
        'This version of the application is outdated. Please upgrade to the newest version.',
    };
  // Compare versions
  if (semver.lt(currentAppVersion, minSupportedVersion)) {
    return {
      success: false,
      message:
        'This version of the application is outdated. Please upgrade to the newest version.',
    };
  }
  return {success: true};
};

/**
 * Check whether an element is a non-empty object.
 *
 * @description
 * Validate that the object is JSON-like type object with at least one key-value pair.
 * For arrays, return false.
 *
 * @param {any} input Element/variable to check
 * @returns {boolean} True if the element is a non-empty object, false otherwise.
 */
export function isNonEmptyObject(input: any) {
  try {
    return (
      input &&
      typeof input === 'object' &&
      !Array.isArray(input) &&
      Object.keys(input).length > 0
    );
  } catch (error: any) {
    return false;
  }
}
