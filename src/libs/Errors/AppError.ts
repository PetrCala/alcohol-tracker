/**
 * A custom error class that extends the native Error class.
 * This provides a unified structure for error handling throughout the application.
 */
export default class AppError extends Error {
  public title: string;

  public code: string;

  constructor(message: string, title = 'Error', code = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'AppError';
    this.title = title;
    this.code = code;

    // Restore the prototype chain (necessary when extending built-ins)
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
