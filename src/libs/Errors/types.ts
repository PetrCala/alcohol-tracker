import type {ErrorKey} from '@src/ERRORS';
import type {NonFinalNodePaths, TranslationPaths} from '@src/languages/types';
// import {NonFinalPaths, TranslationBase} from '@src/languages/types';

/**
 * Represents the details of an error, including a user-friendly title and a descriptive message.
 *
 */
type ErrorDetails = {
  /** A short, descriptive title for the error.  */
  title: string;

  /** A detailed message explaining the error or providing guidance to the user.  */
  message: TranslationPaths;
};

/**
 * Represents the mapping of error keys to their corresponding details, including title and message.
 */
type ErrorMapping = Record<ErrorKey, NonFinalNodePaths>;

export type {ErrorDetails, ErrorMapping};
