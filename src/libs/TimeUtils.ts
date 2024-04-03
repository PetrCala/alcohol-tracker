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
function numberToVerboseString(
  number: number,
  addAgo: boolean = true,
  useAbbreviation: boolean = false,
): string {
  // Format the number into human-readable form based on its age
  let count: number;
  let unit: string;
  switch (true) {
    case number < 60 * 1000:
      count = Math.floor(number / 1000);
      unit = 'second';
      break;
    case number < 60 * 60 * 1000:
      count = Math.floor(number / (60 * 1000));
      unit = 'minute';
      break;
    case number < 24 * 60 * 60 * 1000:
      count = Math.floor(number / (60 * 60 * 1000));
      unit = 'hour';
      break;
    case number < 2 * 7 * 24 * 60 * 60 * 1000: // 2 weeks
      count = Math.floor(number / (24 * 60 * 60 * 1000));
      unit = 'day';
      break;
    case number < 2 * 30 * 24 * 60 * 60 * 1000: // 2 months
      count = Math.floor(number / (7 * 24 * 60 * 60 * 1000));
      unit = 'week';
      break;
    case number < 365 * 24 * 60 * 60 * 1000:
      count = Math.floor(number / (30 * 24 * 60 * 60 * 1000));
      unit = 'month';
      break;
    default:
      count = Math.floor(number / (365 * 24 * 60 * 60 * 1000));
      unit = 'year';
  }

  const unitInfo = useAbbreviation
    ? unit.charAt(0)
    : `
     ${unit}${getPlural(count)}
    `;
  return `${count}${unitInfo}${addAgo ? ' ago' : ''}`;
}

function getTimestampAge(
  timestamp: number | null | undefined,
  addAgo: boolean = true,
  useAbbreviation: boolean = false,
): string | null | undefined {
  if (!timestamp) return null;
  const now = Date.now();
  const difference = now - timestamp;
  return numberToVerboseString(difference, addAgo, useAbbreviation);
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
