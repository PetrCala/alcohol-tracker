/**
 * Represents the details of an error, including a user-friendly title and a descriptive message.
 */
type ErrorDetails = {
  /** A short, descriptive title for the error.  */
  title: string;

  /** A detailed message explaining the error or providing guidance to the user.  */
  message: string;
};

/**
 * Maps an error key to its corresponding details, including the title and message.
 */
type ErrorMapping = {
  /** The unique identifier for the error, used to match specific error scenarios.  */
  key: string;

  /** A short, descriptive title for the error, providing immediate context to the user.  */
  title: string;

  /** A detailed message explaining the error or suggesting next steps for the user.  */
  message: string;
};

export type {ErrorDetails, ErrorMapping};
