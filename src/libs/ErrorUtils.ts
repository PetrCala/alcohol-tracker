import {Alert} from 'react-native';
import mapValues from 'lodash/mapValues';
import type {OnyxEntry} from 'react-native-onyx';
import type {TranslationPaths} from '@src/languages/types';
import type {ErrorFields, Errors} from '@src/types/onyx/OnyxCommon';
import AppError from '@libs/Errors/AppError';
import ERROR_MAPPING from '@libs/Errors/ERROR_MAPPING';
import DateUtils from './DateUtils';
import * as Localize from './Localize';
import ERRORS from '@src/ERRORS';

/**
 * Transforms an unknown error into a typed AppError object with a title and message.
 *
 * @param error - The unknown error object to be processed.
 * @returns An AppError instance representing the provided error.
 */
function getAppError(error: unknown): AppError {
  const errMessage = error instanceof Error ? error.message : ERRORS.UNKNOWN;

  for (const {key, title, message} of ERROR_MAPPING) {
    if (errMessage.includes(key)) {
      return new AppError(message, title, key);
    }
  }

  return new AppError(errMessage);
}

/**
 * Raise an alert message from an error.
 *
 * @param error The error (unknown type)
 * @param heading A custom heading to use (defaults to the error's inherent title if not provided)
 * @param message A custom message to prepend to the returned error message
 */
function raiseAlert(error: unknown, heading = '', message = ''): void {
  const appError = getAppError(error);
  const alertHeading = heading || appError.title;
  const alertMessage = `${message}${appError.message}`;
  Alert.alert(alertHeading, alertMessage);
}

/**
 * Creates an error object with a timestamp (in microseconds) as the key and the translated error message as the value.
 * @param error - The translation key for the error message.
 */
function getMicroSecondOnyxErrorWithTranslationKey(
  error: TranslationPaths,
  errorKey?: number,
): Errors {
  return {
    [errorKey ?? DateUtils.getMicroseconds()]: Localize.translateLocal(error),
  };
}

/**
 * Creates an error object with a timestamp (in microseconds) as the key and the error message as the value.
 * @param error - The error message.
 */
function getMicroSecondOnyxErrorWithMessage(
  error: string,
  errorKey?: number,
): Errors {
  return {[errorKey ?? DateUtils.getMicroseconds()]: error};
}

/**
 * Method used to get an error object with microsecond as the key and an object as the value.
 * @param error - error key or message to be saved
 */
function getMicroSecondOnyxErrorObject(
  error: Errors,
  errorKey?: number,
): ErrorFields {
  return {[errorKey ?? DateUtils.getMicroseconds()]: error};
}

// We can assume that if error is a string, it has already been translated because it is server error
function getErrorMessageWithTranslationData(error: string | null): string {
  return error ?? '';
}

type OnyxDataWithErrors = {
  errors?: Errors | null;
};

function getLatestErrorMessage<TOnyxData extends OnyxDataWithErrors>(
  onyxData: OnyxEntry<TOnyxData> | null,
): string {
  const errors = onyxData?.errors ?? {};

  if (Object.keys(errors).length === 0) {
    return '';
  }

  const key = Object.keys(errors).sort().reverse()[0];
  return getErrorMessageWithTranslationData(errors[key] ?? '');
}

function getLatestErrorMessageField<TOnyxData extends OnyxDataWithErrors>(
  onyxData: OnyxEntry<TOnyxData>,
): Errors {
  const errors = onyxData?.errors ?? {};

  if (Object.keys(errors).length === 0) {
    return {};
  }

  const key = Object.keys(errors).sort().reverse()[0];

  return {key: errors[key]};
}

type OnyxDataWithErrorFields = {
  errorFields?: ErrorFields;
};

function getLatestErrorField<TOnyxData extends OnyxDataWithErrorFields>(
  onyxData: OnyxEntry<TOnyxData>,
  fieldName: string,
): Errors {
  const errorsForField = onyxData?.errorFields?.[fieldName] ?? {};

  if (Object.keys(errorsForField).length === 0) {
    return {};
  }

  const key = Object.keys(errorsForField).sort().reverse()[0];
  return {[key]: getErrorMessageWithTranslationData(errorsForField[key])};
}

function getEarliestErrorField<TOnyxData extends OnyxDataWithErrorFields>(
  onyxData: OnyxEntry<TOnyxData>,
  fieldName: string,
): Errors {
  const errorsForField = onyxData?.errorFields?.[fieldName] ?? {};

  if (Object.keys(errorsForField).length === 0) {
    return {};
  }

  const key = Object.keys(errorsForField).sort()[0];
  return {[key]: getErrorMessageWithTranslationData(errorsForField[key])};
}

/**
 * Method used to get the latest error field for any field
 */
function getLatestErrorFieldForAnyField<
  TOnyxData extends OnyxDataWithErrorFields,
>(onyxData: OnyxEntry<TOnyxData>): Errors {
  const errorFields = onyxData?.errorFields ?? {};

  if (Object.keys(errorFields).length === 0) {
    return {};
  }

  const fieldNames = Object.keys(errorFields);
  const latestErrorFields = fieldNames.map(fieldName =>
    getLatestErrorField(onyxData, fieldName),
  );
  return latestErrorFields.reduce(
    (acc, error) => Object.assign(acc, error),
    {},
  );
}

/**
 * Method used to attach already translated message
 * @param errors - An object containing current errors in the form
 * @returns Errors in the form of {timestamp: message}
 */
function getErrorsWithTranslationData(errors: Errors): Errors {
  if (!errors) {
    return {};
  }

  if (typeof errors === 'string') {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return {'0': getErrorMessageWithTranslationData(errors)};
  }

  return mapValues(errors, getErrorMessageWithTranslationData);
}

/**
 * Method used to generate error message for given inputID
 * @param errors - An object containing current errors in the form
 * @param message - Message to assign to the inputID errors
 */
function addErrorMessage(
  errors: Errors,
  inputID?: string | null,
  message?: string | null,
) {
  if (!message || !inputID) {
    return;
  }

  const errorList = errors;
  const error = errorList[inputID];

  if (!error) {
    errorList[inputID] = message;
  } else if (typeof error === 'string') {
    errorList[inputID] = `${error}\n${message}`;
  }
}

export {
  getAppError,
  addErrorMessage,
  getEarliestErrorField,
  getErrorMessageWithTranslationData,
  getErrorsWithTranslationData,
  getLatestErrorField,
  getLatestErrorFieldForAnyField,
  getLatestErrorMessage,
  getLatestErrorMessageField,
  getMicroSecondOnyxErrorWithTranslationKey,
  getMicroSecondOnyxErrorWithMessage,
  getMicroSecondOnyxErrorObject,
  raiseAlert,
};

export type {OnyxDataWithErrors};
