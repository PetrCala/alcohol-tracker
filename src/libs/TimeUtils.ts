import {getPlural, shouldUsePlural} from './StringUtilsKiroku';
import CONST from '@src/CONST';
import {TranslationPaths} from '@src/languages/types';
import * as Localize from '@libs/Localize';
import type {TimeUnit} from '@src/types/onyx/OnyxCommon';

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
  duration: number,
  addAgo = true,
  useAbbreviation = false,
): string {
  // Format the number into human-readable form based on its age
  let count: number;
  let unit: TimeUnit;

  if (duration < 60 * 1000) {
    count = Math.floor(duration / 1000);
    unit = CONST.TIME_UNITS.SECOND;
  } else if (duration < 60 * 60 * 1000) {
    count = Math.floor(duration / (60 * 1000));
    unit = CONST.TIME_UNITS.MINUTE;
  } else if (duration < 24 * 60 * 60 * 1000) {
    count = Math.floor(duration / (60 * 60 * 1000));
    unit = CONST.TIME_UNITS.HOUR;
  } else if (duration < 2 * 7 * 24 * 60 * 60 * 1000) {
    // 2 weeks
    count = Math.floor(duration / (24 * 60 * 60 * 1000));
    unit = CONST.TIME_UNITS.DAY;
  } else if (duration < 2 * 30 * 24 * 60 * 60 * 1000) {
    // 2 months
    count = Math.floor(duration / (7 * 24 * 60 * 60 * 1000));
    unit = CONST.TIME_UNITS.WEEK;
  } else if (duration < 365 * 24 * 60 * 60 * 1000) {
    count = Math.floor(duration / (30 * 24 * 60 * 60 * 1000));
    unit = CONST.TIME_UNITS.MONTH;
  } else {
    count = Math.floor(duration / (365 * 24 * 60 * 60 * 1000));
    unit = CONST.TIME_UNITS.YEAR;
  }

  const fullNamePath: TranslationPaths = shouldUsePlural(count)
    ? `timePeriods.fullSingle.${unit}`
    : `timePeriods.fullPlural.${unit}`;

  const unitTranslationKey: TranslationPaths = useAbbreviation
    ? `timePeriods.abbreviated.${unit}`
    : fullNamePath;

  const unitsString = Localize.translateLocal(unitTranslationKey);
  const agoString = addAgo ? ` ${Localize.translateLocal('common.ago')}` : '';

  return `${count}${unitsString}${agoString}`;
}

function getTimestampAge(
  timestamp: number | null | undefined,
  addAgo = true,
  useAbbreviation = false,
): string {
  if (!timestamp) {
    return '';
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
