import semver from 'semver';
import CONST from '@src/CONST';

import type {AppSettings} from '@src/types/onyx';
import {version as _version} from '../../package.json';

const version: string = _version;

type ValidationResult = {
  success: boolean;
  message?: string;
  updateAvailable?: boolean;
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
 * @param input Input string to check.
 * @returns True if the string is valid, false otherwise.
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
      message: `Your nickname can not contain ${CONST.INVALID_CHARS.join(', ')}`,
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

/** Validate that a string is semver-able. If not, throw an error.
 *
 * SemVer regex pattern to match MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
 * Explanation:
 * - ^v? optional 'v' at the beginning
 * - (0|[1-9]\d*) matches the major version (0, or any non-zero digit followed by any digits)
 * - \.(0|[1-9]\d*) matches the minor version, prefixed by a dot
 * - \.(0|[1-9]\d*) matches the patch version, prefixed by a dot
 * - (-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)? optionally matches pre-release version, prefixed by a hyphen
 * - (\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)? optionally matches build metadata, prefixed by a plus
 * - $ end of string
 *
 * @example
 * validateSemver('1.0.0'); // Valid, no error thrown
 * validateSemver('2.10.3-alpha.1+build.456'); // Valid, no error thrown
 * validateSemver('01.0.0'); // Invalid, error thrown
 */
export function validateSemver(version: string): void {
  const semverRegex =
    /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
  if (!semverRegex.test(version)) {
    throw new Error('Invalid SemVer version.');
  }
}

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
 * @returns Validation result type object.
 */
export const validateAppVersion = (
  appSettings: AppSettings,
  currentAppVersion: string = version,
): ValidationResult => {
  const cleanCurrentAppVersion = cleanSemver(currentAppVersion); // No build metadata

  const minVersion = appSettings?.min_supported_version;
  if (!minVersion || semver.lt(cleanCurrentAppVersion, minVersion)) {
    return {
      success: false,
      message:
        'This version of the application is outdated. Please upgrade to the newest version.',
    };
  }

  const latestVersion = appSettings?.latest_version;
  if (latestVersion && semver.gt(latestVersion, cleanCurrentAppVersion)) {
    return {
      success: true,
      updateAvailable: true,
      message: 'A new version of the application is available.',
    };
  }

  return {
    success: true,
  };
};

/**
 * Check whether an element is a non-empty object.
 *
 * @description
 * Validate that the object is JSON-like type object with at least one key-value pair.
 * For arrays, return false.
 *
 * @param input Element/variable to check
 * @returns True if the element is a non-empty object, false otherwise.
 */
export function isNonEmptyObject(input: any): boolean {
  try {
    return (
      input &&
      typeof input === 'object' &&
      !Array.isArray(input) &&
      Object.keys(input).length > 0
    );
  } catch (error: Error | unknown) {
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

export type {ValidationResult};
