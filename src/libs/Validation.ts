import semver from 'semver';
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
 * Checks if the given email is valid.
 * @param email - The email to be validated.
 * @returns True if the email is valid, false otherwise.
 */
export function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

/**
 * Validate that a string does not contain any characters not accepted
 * as keys by the Realtime Firebase.
 *
 * @param {string} input Input string to check.
 * @returns {boolean} True if the string is valid, false otherwise.
 */
export function isValidString(input: string): boolean {
  for (const char of CONST.INVALID_CHARS) {
    if (input.includes(char)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if a password is valid.
 * @param password - The password to validate.
 * @returns True if the password is valid, false otherwise.
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Checks if the given password matches the password confirmation.
 * @param password - The password to be validated.
 * @param passwordConfirm - The password confirmation to be compared with the password.
 * @returns True if the password matches the password confirmation, false otherwise.
 */
export function isValidPasswordConfirm(
  password: string,
  passwordConfirm: string,
): boolean {
  return password === passwordConfirm;
}

/**
 * Having a list of input sign in text, check that all fields are valid. Return the
 * results as a ValidationResult object.
 *
 * @param email User mail
 * @param username User name
 * @param password User password
 */
export const validateSignInInput = (
  email: string,
  username: string,
  password: string,
  passwordConfirm: string,
): ValidationResult => {
  if (
    email == '' ||
    username == '' ||
    password == '' ||
    passwordConfirm == ''
  ) {
    return {success: false, message: 'Please fill out all fields first'};
  }
  if (!isValidEmail(email)) {
    return {
      success: false,
      message: 'Please enter a valid email address',
    };
  }
  if (!isValidString(username) && username !== '') {
    return {
      success: false,
      message:
        'Your nickname can not contain ' + CONST.INVALID_CHARS.join(', '),
    };
  }
  if (!isValidPassword(password)) {
    return {
      success: false,
      message: 'Your password must be at least 6 characters long',
    };
  }
  if (!isValidPasswordConfirm(password, passwordConfirm)) {
    return {
      success: false,
      message: 'Your passwords do not match',
    };
  }
  return {success: true};
};

/**
 * Cleans a semantic version string by extracting the major, minor, and patch version components.
 * @param version - The semantic version string to clean.
 * @returns The cleaned semantic version string containing only the major, minor, and patch version components.
 */
export function cleanSemver(version: string): string {
  const regex = /^(\d+\.\d+\.\d+)/;
  const match = version.match(regex);
  return match ? match[1] : version;
}

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
  if (!minSupportedVersion)
    // Allowing to be null allows cleaner code down the line
    return {
      success: false,
      message:
        'This version of the application is outdated. Please upgrade to the newest version.',
    };
  // Compare versions
  let cleanCurrentAppVersion = cleanSemver(currentAppVersion); // No build metadata
  if (semver.lt(cleanCurrentAppVersion, minSupportedVersion)) {
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
export function isNonEmptyObject(input: any): boolean {
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

/**
 * Checks if the input is a non-empty array.
 * @param input - The input to be checked.
 * @returns True if the input is a non-empty array, false otherwise.
 */
export function isNonEmptyArray(input: any) {
  return Array.isArray(input) && input.length > 0;
}
