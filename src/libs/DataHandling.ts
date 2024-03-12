import {DateObject, DateString} from '@src/types/time';
import {getRandomInt} from './Choice';
import type {
  CalendarColors,
  DayMarking,
  SessionsCalendarDatesType,
  SessionsCalendarMarkedDates,
} from '@components/Calendar';
import type {
  DrinkingSession,
  DrinkingSessionArray,
  DrinkingSessionList,
  Preferences,
  UnitKey,
  UnitName,
  Units,
  UnitsList,
  UnitsToColors,
  UnitsToPoints,
} from '@src/types/database';
import CONST from '../CONST';
import {MeasureType} from '@src/types/database/DatabaseCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

export function formatDate(date: Date): DateString {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}` as DateString;
}

export function formatDateToDay(date: Date): string {
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

export function formatDateToTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

/** Convert a timestamp to a Date object */
export function timestampToDate(timestamp: number): Date {
  return new Date(timestamp);
}

/** Convert a Date type object to a JSON-type DateObject.
 * Month is indexed from 1 in this object
 *
 * @param date Date type object
 * @returns A DateObject
 */
export function dateToDateObject(date: Date): DateObject {
  const dateObject = {
    dateString: formatDate(date),
    day: date.getDate(),
    month: date.getMonth() + 1,
    timestamp: date.getTime(),
    year: date.getFullYear(),
  };
  return dateObject;
}

/**
 * Convert a timestamp to a date string.
 *
 * @param timestamp Timestamp
 * @returns Date string
 */
export function timestampToDateString(timestamp: number): DateString {
  return formatDate(timestampToDate(timestamp));
}

/** Inverse of timestampToDate, sets time to midnight
 */
export function getTimestampAtMidnight(date: Date): number {
  const dateAtMidnight = new Date(date);
  dateAtMidnight.setHours(0, 0, 0, 0);
  return dateAtMidnight.getTime();
}

export function getTimestampAtNoon(date: Date): number {
  const dateAtMidnight = new Date(date);
  dateAtMidnight.setHours(12, 0, 0, 0);
  return dateAtMidnight.getTime();
}

export function dateStringToDate(dateString: DateString): Date {
  return new Date(dateString);
}

/** Input a Date type object and change its day by a certain amount
 *
 * @param date Date type object
 * @param days Number of days to change the date by
 * @returns A new, modified Date type object
 */
export function changeDateBySomeDays(date: Date, days: number): Date {
  let newDate = new Date(date); // to avoid mutating original date
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

/** Input a DateObject and change it to the following month.
 *
 * @param currentDate Current date as a DateObject
 * @returns Next month's date as a DateObject
 */
export const getNextMonth = (currentDate: DateObject): DateObject => {
  // Setting it to the same day of the next month
  let newDate = new Date(
    currentDate.year,
    currentDate.month - 1,
    currentDate.day,
  );
  let originalMonth = newDate.getMonth();

  newDate.setMonth(originalMonth + 1);
  // If the day got changed because the next month doesn't have that day (e.g. 31 Aug to 1 Sep)
  if ((newDate.getMonth() - originalMonth + 12) % 12 !== 1) {
    newDate.setDate(0); // Setting the date to the last day of the previous month
  }

  return dateToDateObject(newDate);
};

/** Input a DateObject and change it to the previous month.
 *
 * @param currentDate Current date as a DateObject
 * @returns Previous month's date as a DateObject
 */
export const getPreviousMonth = (currentDate: DateObject): DateObject => {
  // Setting it to the same day of the previous month
  let newDate = new Date(
    currentDate.year,
    currentDate.month - 1,
    currentDate.day,
  );
  let originalMonth = newDate.getMonth();

  newDate.setMonth(originalMonth - 1);

  // If the day got changed because the previous month doesn't have that day (e.g., 31st March to something not 31st February)
  if ((newDate.getMonth() - originalMonth + 12) % 12 !== 11) {
    newDate.setDate(0); // Setting the date to the last day of the previous month
  }

  return dateToDateObject(newDate);
};

/**
 * Returns an array of DateObjects representing months adjacent to the input DateObject.
 * The number of months returned before and after the input month is determined by the input number `n`.
 *
 * For example, if given a DateObject for September and n = 2, the returned array will have
 * DateObjects for July, August, September, October, and November.
 *
 * @param currentDate - The reference date from which adjacent months are computed.
 * @param n - The number of months to compute before and after the `currentDate`.
 *
 * @returns - An array of DateObjects, including the `currentDate` and `n` months before and after it.
 *
 * @example
 * const inputDate: DateObject = {
 *     dateString: '2023-09-15',
 *     day: 15,
 *     month: 9,
 *     timestamp: 1684560000000,
 *     year: 2023,
 * };
 * const outputDates = getAdjacentMonths(inputDate, 2);
 * console.log(outputDates);
 * // Expected output: DateObjects for July, August, September, October, and November of 2023.
 */
export const getAdjacentMonths = (
  currentDate: DateObject,
  n: number,
): DateObject[] => {
  const result: DateObject[] = [currentDate]; // Start with the input date

  // Add next n months
  let nextDate = currentDate;
  for (let i = 0; i < n; i++) {
    nextDate = getNextMonth(nextDate);
    result.push(nextDate);
  }

  // Add previous n months
  let prevDate = currentDate;
  for (let i = 0; i < n; i++) {
    prevDate = getPreviousMonth(prevDate);
    result.unshift(prevDate); // Add to the beginning
  }

  return result;
};

/** Using a date object, return a year-month string in the format YYYY-MM.
 *
 * @param dateObject Date object
 * @returns Year-Month string, e.g. '2023-08'
 *
 * @example let yearMonth = getYearMonth(testDateObject);
 */
export function getYearMonth(dateObject: DateObject): string {
  return `${dateObject.year}-${String(dateObject.month).padStart(2, '0')}`;
}

/**
 * Returns a string representation of the month and year in the format "MMM/YYYY" or with full month names (default)
 *
 * @param dateObject - An object containing numeric values for 'year' and 'month'.
 * @param abbreviated - If true, return the months in the abbreviated format, returns to false.
 * @returns - A string in the format "MMM/YYYY", where "MMM" is the abbreviated or full month name.
 *
 * @example
 * const date = { year: 2023, month: 10 };
 * getYearMonthVerbose(date, true); // Returns "Oct/2023"
 */
export function getYearMonthVerbose(
  dateObject: DateObject,
  abbreviated: boolean = false,
): string {
  const months = abbreviated ? CONST.MONTHS_ABBREVIATED : CONST.MONTHS;
  const monthName = months[dateObject.month - 1];
  return `${monthName} ${dateObject.year}`;
}

/** Change the time of a datetime object to now,
 * keeping the date constant.
 */
export function setDateToCurrentTime(inputDate: Date): Date {
  const currentTime = new Date();

  inputDate.setHours(currentTime.getHours());
  inputDate.setMinutes(currentTime.getMinutes());
  inputDate.setSeconds(currentTime.getSeconds());
  inputDate.setMilliseconds(currentTime.getMilliseconds());

  return inputDate;
}

/** Subset an array of drinking sessions to a single day.
 *
 * @param dateObject Date type object for whose day to subset the sessions to
 * @param sessions An array of sessions to subset
 * @returns The subsetted array of sessions
 */
export function getSingleDayDrinkingSessions(
  date: Date,
  sessions: DrinkingSessionList | undefined,
) {
  if (isEmptyObject(sessions)) return [];
  // Define the time boundaries
  date.setHours(0, 0, 0, 0); // set to start of day

  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1); // set to start of next day

  // Convert to UNIX timestamp
  const todayUnix = Math.floor(date.getTime());
  const tomorrowUnix = Math.floor(tomorrow.getTime());

  const filteredSessions = Object.values(sessions).filter(
    session =>
      session.start_time >= todayUnix && session.start_time < tomorrowUnix,
  );

  // Return the sessions between those indices
  return filteredSessions;
}

/** Subset an array of drinking sessions to the current month only.
 *
 * @param dateObject Date type object for whose month to subset the sessions to
 * @param sessions An array of sessions to subset
 * @param untilToday If true, include no sessions that occured after today
 * @returns The subsetted array of sessions
 */
export function getSingleMonthDrinkingSessions(
  date: Date,
  sessions: DrinkingSessionArray,
  untilToday: boolean = false,
) {
  if (!sessions) return [];
  date.setHours(0, 0, 0, 0); // To midnight
  // Find the beginning date
  let firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  let beginningDate = firstDayOfMonth;
  // Find the end date
  const firstDayOfNextMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1,
  );
  let endDate = firstDayOfNextMonth;
  if (untilToday) {
    let today = new Date(); // automatically set to midnight
    let tomorrowMidnight = changeDateBySomeDays(today, 1);
    if (endDate >= tomorrowMidnight) {
      endDate = tomorrowMidnight; // Filter until today only
    }
  }
  // Find the timestamps
  const beginningUnix = Math.floor(beginningDate.getTime());
  const endUnix = Math.floor(endDate.getTime());
  // Filter to current month only
  const monthDrinkingSessions = sessions.filter(
    session =>
      session.start_time >= beginningUnix && session.start_time < endUnix,
  );
  return monthDrinkingSessions;
}

export function aggregateSessionsByDays(
  sessions: DrinkingSession[],
  measureType: MeasureType = 'points',
  unitsToPoints?: Units,
): SessionsCalendarDatesType {
  return sessions.reduce(
    (acc: SessionsCalendarDatesType, item: DrinkingSession) => {
      let dateString = formatDate(new Date(item.start_time)); // MM-DD-YYYY
      let newUnits: number;
      if (measureType === 'points') {
        if (!unitsToPoints)
          throw new Error('You must specify the point conversion');
        newUnits = sumAllPoints(item.units, unitsToPoints);
      } else if (measureType === 'units') {
        newUnits = sumAllUnits(item.units);
      } else {
        throw new Error('Unknown measure type');
      }
      acc[dateString] = acc[dateString]
        ? {
            // Already an entry exists
            units: acc[dateString].units + newUnits, // Does not distinguish between units/points
            blackout: acc[dateString].blackout === false ? item.blackout : true,
          }
        : {
            // First entry
            units: newUnits,
            blackout: item.blackout,
          };

      return acc;
    },
    {},
  );
}

export function monthEntriesToColors(
  sessions: SessionsCalendarDatesType,
  preferences: Preferences,
) {
  // MarkedDates object, see official react-native-calendars docs
  let markedDates: SessionsCalendarMarkedDates = Object.entries(
    sessions,
  ).reduce(
    (
      acc: SessionsCalendarMarkedDates,
      [key, {units: value, blackout: blackoutInfo}],
    ) => {
      let unitsToColorsInfo = preferences.units_to_colors;
      let color: CalendarColors = unitsToColors(value, unitsToColorsInfo);
      if (blackoutInfo === true) {
        color = 'black';
      }
      let textColor: string = 'black';
      if (color == 'red' ?? color == 'green' ?? color == 'black') {
        textColor = 'white';
      }
      let markingObject: DayMarking = {
        units: value, // number of units
        color: color,
        textColor: textColor,
      };
      acc[key] = markingObject;
      return acc;
    },
    {},
  );
  return markedDates;
}

/** Sum up all units of alcohol regardless of category
 *
 * @param all_units Units to sum up.
 */
export function sumAllUnits(units: UnitsList | undefined): number {
  if (isEmptyObject(units)) return 0;
  return Object.values(units).reduce((total, unitTypes) => {
    return (
      total +
      Object.values(unitTypes).reduce(
        (subTotal, unitCount) => subTotal + (unitCount ?? 0),
        0,
      )
    );
  }, 0);
}

/** Sum up units of a specific type of alcohol across multiple sessions
 *
 * @param unitsObject UnitsList to sum up.
 * @param unitType The type of unit to sum.
 */
export function sumUnitsOfSingleType(
  unitsObject: UnitsList | undefined,
  unitType: UnitKey,
): number {
  if (!unitsObject) return 0;
  return Object.values(unitsObject).reduce((total, session) => {
    return total + (session[unitType] ?? 0);
  }, 0);
}

/** Sum up units of a single Unit type object.
 *
 * @param unitTypes A Units kind of object
 * @returns The sum
 */
export function sumUnitTypes(unitTypes: Units): number {
  if (!unitTypes) return 0;
  return Object.values(unitTypes).reduce(
    (subTotal, unitCount) => subTotal + (unitCount ?? 0),
    0,
  );
}

/** Type guard to check if a given key is a valid UnitType key */
export function isUnitTypeKey(key: string): key is keyof Units {
  return Object.values(CONST.UNITS.KEYS).includes(key as any);
}

/** Using a UnitsList and the units to points conversion object, calculate how many points this object amounts to.
 *
 * @param unitsObject UnitsList type
 * @param unitsToPoits Units to point conversion object
 * @returns Number of points
 *
 * @example let points = sumAllPoints({
 * [1694819284]: {'beer': 5},
 * [1694819286]: {'wine': 2, 'cocktail': 1},
 * }, unitsToPoints)
 */
export function sumAllPoints(
  unitsObject: UnitsList | undefined,
  unitsToPoints: Units,
): number {
  if (isEmptyObject(unitsObject)) return 0;
  let totalPoints = 0;
  // Iterate over each timestamp in unitsObject
  for (const unitTypes of Object.values(unitsObject)) {
    // Iterate over each key in the unitTypes of the current timestamp
    for (const unitKey of Object.keys(unitTypes)) {
      if (isUnitTypeKey(unitKey)) {
        const typeUnits = unitTypes[unitKey] ?? 0;
        const typePoints = unitsToPoints[unitKey] ?? 0;
        totalPoints += typeUnits * typePoints;
      }
    }
  }
  return totalPoints;
}

/** Input a session item and return the timestamp of the last unit
 * consumed in that session.
 *
 * @param session Drinking session array item
 * @return Timestamp of the last unit consumed
 */
export function getLastUnitAddedTime(session: DrinkingSession): number | null {
  if (isEmptyObject(session?.units)) return null;
  const timestamps = Object.keys(session.units).map(Number); // All timestamps
  // Return the maximum timestamp or null if there aren't any
  return timestamps.length ? Math.max(...timestamps) : null;
}

/** Out of an array of session items, return an a session that is ongoing. If there is no such session, return null
 */
export function findOngoingSession(
  sessions: DrinkingSessionList,
): DrinkingSession | null {
  if (isEmptyObject(sessions)) return null;
  const ongoingSession = Object.values(sessions).find(
    session => session.ongoing === true,
  );
  return ongoingSession ? ongoingSession : null;
}

/** Enter a dateObject and an array of drinking sessions and calculate
 * units consumed in the current month.
 *
 * @param dateObject DateObject
 * @param sessions Array of drinking sessions
 * @returns Number of units consumed during the current month
 */
export const calculateThisMonthUnits = (
  dateObject: DateObject,
  sessions: DrinkingSessionArray,
): number => {
  // Subset to this month's sessions only
  const currentDate = timestampToDate(dateObject.timestamp);
  const sessionsThisMonth = getSingleMonthDrinkingSessions(
    currentDate,
    sessions,
    false,
  );
  // Sum up the units
  return sessionsThisMonth.reduce(
    (sum, session) => sum + sumAllUnits(session.units),
    0,
  );
};

/** Enter a dateObject and an array of drinking sessions and calculate
 * points for units consumed in the current month.
 *
 * @param dateObject DateObject
 * @param sessions Array of drinking sessions
 * @param unitsToPoints Units to points conversion object
 * @returns Number of points for units consumed during the current month
 */
export const calculateThisMonthPoints = (
  dateObject: DateObject,
  sessions: DrinkingSessionArray,
  unitsToPoints: UnitsToPoints,
): number => {
  if (!sessions) return 0;
  // Subset to this month's sessions only
  const currentDate = timestampToDate(dateObject.timestamp);
  const sessionsThisMonth = getSingleMonthDrinkingSessions(
    currentDate,
    sessions,
    false,
  );
  // Sum up the units
  return sessionsThisMonth.reduce(
    (sum, session) => sum + sumAllPoints(session.units, unitsToPoints),
    0,
  );
};

/** List all units to add and their amounts and add this to the current units hook
 *
 * @param units Units kind of object listing each unit to add and its amount
 */
export const addUnits = (
  existingUnits: UnitsList | undefined,
  units: Units,
): UnitsList | undefined => {
  if (isEmptyObject(units)) return existingUnits;
  let newUnits: UnitsList = {
    ...existingUnits,
    [Date.now()]: units,
  };
  return newUnits;
};

/** Specify the kind of unit to remove units from and the number of units to remove.
 * Remove this many units from that kind of unit
 *
 * @param unitType Kind of unit to remove the units from
 * @param number Number of units to remove
 */
export const removeUnits = (
  existingUnits: UnitsList | undefined,
  unitType: UnitKey,
  count: number,
): UnitsList | undefined => {
  if (isEmptyObject(existingUnits)) return existingUnits;
  let unitsToRemove = count;
  const updatedUnits: UnitsList = JSON.parse(JSON.stringify(existingUnits)); // Deep copy
  for (const timestamp of Object.keys(updatedUnits).sort((a, b) => +b - +a)) {
    // sort in descending order
    const unitsAtTimestamp = updatedUnits[+timestamp] ?? {};
    const availableUnits = unitsAtTimestamp[unitType] ?? 0;
    if (availableUnits > 0) {
      const unitsToRemoveNow = Math.min(unitsToRemove, availableUnits);
      unitsAtTimestamp[unitType] = availableUnits - unitsToRemoveNow;
      unitsToRemove -= unitsToRemoveNow;

      // Clean up if there are zero units left for this type at this timestamp
      if (unitsAtTimestamp[unitType] === 0) {
        delete unitsAtTimestamp[unitType];
      }

      // Clean up if there are zero units left at this timestamp
      if (Object.keys(unitsAtTimestamp).length === 0) {
        delete updatedUnits[+timestamp];
      }

      // Add a zero-unit placeholder if there are no units left in the object
      if (Object.keys(updatedUnits).length === 0) {
        updatedUnits[+timestamp] = {other: 0};
      }
    }

    if (unitsToRemove <= 0) {
      break;
    }
  }
  return updatedUnits;
};

/** Input a drinking session and remove all unit records
 * where all units of a given timestamp are set to 0. Return the
 * updated session.
 *
 * @param session Drinking session
 * @returns The updated session
 */
export const removeZeroObjectsFromSession = (
  session: DrinkingSession,
): DrinkingSession => {
  // Clone the session object to avoid mutating the original object
  const updatedSession = {...session};

  if (updatedSession.units === undefined) {
    return updatedSession;
  }

  // Go through each timestamp in the session's units object
  for (const timestamp in updatedSession.units) {
    // Check if all the unit values are set to 0
    const allZero = Object.values(CONST.UNITS.KEYS).every(
      key =>
        // ! to assert that the value is not undefined
        updatedSession.units![timestamp][key] === 0 ||
        updatedSession.units![timestamp][key] === undefined,
    );

    // If all unit values are 0, delete the timestamp from the units object, unless it is the last one
    if (allZero && Object.keys(updatedSession.units).length > 1) {
      delete updatedSession.units[+timestamp];
    }
  }

  return updatedSession;
};

/** Generate an object with all available units where
 * each unit's value is set to a random integer.
 */

export const getRandomUnitsList = (maxUnitValue: number = 30): UnitsList => {
  const unitWithRandomValues: Units = {};

  // Loop over each item in UnitTypesKeys and set its value to a random number between 0 and maxUnitValue
  for (const key of Object.values(CONST.UNITS.KEYS)) {
    unitWithRandomValues[key] = getRandomInt(0, maxUnitValue);
  }

  // Create a new object with a current timestamp
  const timestamp = Date.now();
  const result: UnitsList = {
    [timestamp]: unitWithRandomValues,
  };

  return result;
};

/** Generate an object with all available units where each unit's value is set to 0.
 */
export function getZeroUnitsList(): UnitsList {
  return getRandomUnitsList(0);
}

/** Convert the units consumed to colors.
 *
 * @param units Number of units consumed
 * @param unitsToColors Information about limits for different colors
 * @returns String
 */
export function unitsToColors(
  units: number,
  unitsToColors: UnitsToColors,
): CalendarColors {
  let sessionColor: CalendarColors;
  if (units === 0) {
    sessionColor = 'green';
  } else if (units <= unitsToColors.yellow) {
    sessionColor = 'yellow';
  } else if (units <= unitsToColors.orange) {
    sessionColor = 'orange';
  } else {
    sessionColor = 'red';
  }
  return sessionColor;
}

/** Insert the key of a unit and find its matching verbose name.
 *
 * @returns The verbose name of that unit.
 */
export const findUnitName = (key: UnitKey): UnitName | undefined => {
  const unitIdx = Object.values(CONST.UNITS.KEYS).findIndex(
    type => type === key,
  );
  if (unitIdx === -1) return undefined;
  return Object.values(CONST.UNITS.NAMES)[unitIdx];
};

/**
 * Checks if a number has a decimal point.
 * @param number - The number to check.
 * @returns True if the number has a decimal point, false otherwise.
 */
export function hasDecimalPoint(number: number): boolean {
  const numberAsString = number.toString();
  return numberAsString.includes('.');
}

export function toPercentageVerbose(number: number): string {
  if (number > 1 || number < 0) {
    throw new Error('A fraction number must be between 0 and 1.');
  }
  const percentage = number * 100;
  return `${percentage.toFixed(2).toString()}%`;
}

/**
 * Returns an array of keys from the provided object.
 * @param obj - The object to retrieve keys from.
 * @returns An array of keys from the object.
 */
export function objKeys(obj: any): string[] {
  // Check if obj is an object and not null
  if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj);
  }
  // Return an empty array for non-object inputs or null
  return [];
}

/**
 * Returns an array of values from the provided object.
 * @param obj - The object to retrieve keys from.
 * @returns An array of keys from the object.
 */
export function objVals(obj: any): string[] {
  // Check if obj is an object and not null
  if (typeof obj === 'object' && obj !== null) {
    return Object.values(obj);
  }
  // Return an empty array for non-object inputs or null
  return [];
}

// test, getAdjacentMonths, findongoingsession, aggregatesessionsbydays, month entries to colors (move these maybe to a different location), toPercentageVerbose
