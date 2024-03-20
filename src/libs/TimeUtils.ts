import {getPlural} from './StringUtils';

function isRecent(timestamp: number): boolean {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  return now - timestamp < fiveMinutes;
}

/**
 * Converts a number into a verbose string representation of its age.
 * @param number - The number to convert.
 * @param addAgo - Optional. Specifies whether to add "ago" at the end of the string. Default is true.
 * @returns The verbose string representation of the number's age.
 */
function numberToVerboseString(number: number, addAgo: boolean = true): string {
  const formatText = (input: number, unit: string) =>
    `${input} ${unit}${getPlural(input)}${addAgo ? ' ago' : ''}`;

  // Format the number into human-readable form based on its age
  switch (true) {
    case number < 60 * 1000:
      const seconds = Math.floor(number / 1000);
      return formatText(seconds, 'second');
    case number < 60 * 60 * 1000:
      const minutes = Math.floor(number / (60 * 1000));
      return formatText(minutes, 'minute');
    case number < 24 * 60 * 60 * 1000:
      const hours = Math.floor(number / (60 * 60 * 1000));
      return formatText(hours, 'hour');
    case number < 7 * 24 * 60 * 60 * 1000:
      const days = Math.floor(number / (24 * 60 * 60 * 1000));
      return formatText(days, 'day');
    case number < 30 * 24 * 60 * 60 * 1000:
      const weeks = Math.floor(number / (7 * 24 * 60 * 60 * 1000));
      return formatText(weeks, 'week');
    case number < 365 * 24 * 60 * 60 * 1000:
      const months = Math.floor(number / (30 * 24 * 60 * 60 * 1000));
      return formatText(months, 'month');
    default:
      const years = Math.floor(number / (365 * 24 * 60 * 60 * 1000));
      return formatText(years, 'year');
  }
}

function getTimestampAge(timestamp: number, addAgo: boolean = true): string {
  const now = Date.now();
  const difference = now - timestamp;
  return numberToVerboseString(difference, addAgo);
}

/**
 * Waits for a boolean value to be true within a specified timeout period.
 * @param bool The boolean value to wait for.
 * @param timeout The timeout period in milliseconds (default: 30000ms).
 * @returns A promise that resolves to `true` if the boolean value becomes true within the timeout, or `false` if no waiting was needed.
 * @throws {Error} If the timeout period is exceeded before the boolean value becomes true.
 */
async function waitForBooleanToBeTrue(
  bool: boolean,
  timeout: number = 30000,
): Promise<boolean> {
  if (!bool) {
    return false; // No waiting was needed
  }
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      if (!bool) {
        clearInterval(checkInterval);
        resolve(true);
      }
    }, 100); // Check every 100ms

    // Timeout to prevent infinite waiting
    const timeoutId = setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error('Timeout waiting for a boolean to be true'));
    }, timeout);

    // Optionally clear the timeout if the condition is met before the timeout
    return () => clearTimeout(timeoutId);
  });
}

/**
 * Asynchronously waits for a specified number of milliseconds.
 * @example
 * await sleep(1000); // Wait for 1 second
 */
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export {
  isRecent,
  getTimestampAge,
  waitForBooleanToBeTrue,
  sleep,
  numberToVerboseString,
};
