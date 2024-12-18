import {getPlural} from './StringUtilsKiroku';

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
  addAgo = true,
  useAbbreviation = false,
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
      unit = 'Month';
      break;
    default:
      count = Math.floor(number / (365 * 24 * 60 * 60 * 1000));
      unit = 'Year';
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
  addAgo = true,
  useAbbreviation = false,
): string | null | undefined {
  if (!timestamp) {
    return null;
  }
  const now = Date.now();
  const difference = now - timestamp;
  return numberToVerboseString(difference, addAgo, useAbbreviation);
}

/**
 * Asynchronously waits for a specified number of milliseconds.
 * @example
 * await sleep(1000); // Wait for 1 second
 */
function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
}

export {isRecent, getTimestampAge, sleep, numberToVerboseString};
