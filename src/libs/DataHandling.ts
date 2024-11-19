import type {DateObject, DateString} from '@src/types/time';
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
  UnitsToColors,
  DrinksToUnits,
  DrinksList,
  DrinkKey,
  DrinkName,
  Drinks,
} from '@src/types/onyx';
import {formatInTimeZone, utcToZonedTime} from 'date-fns-tz';
import CONST from '../CONST';
import type {MeasureType} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {SelectedTimezone, Timezone} from '@src/types/onyx/UserData';
import _ from 'lodash';
import {endOfMonth, endOfToday, format, startOfMonth} from 'date-fns';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {auth} from './Firebase/FirebaseApp';

let timezone: Required<Timezone> = CONST.DEFAULT_TIME_ZONE;
Onyx.connect({
  key: ONYXKEYS.USER_DATA_LIST,
  callback: value => {
    if (!auth?.currentUser) {
      return;
    }
    const currentUserID = auth?.currentUser?.uid;
    const userDataTimezone = value?.[currentUserID]?.timezone;
    timezone = {
      selected: userDataTimezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected,
      automatic:
        userDataTimezone?.automatic ?? CONST.DEFAULT_TIME_ZONE.automatic,
    };
  },
});

export function formatDate(date: Date): DateString {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}` as DateString;
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
  const newDate = new Date(date); // to avoid mutating original date
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
  const newDate = new Date(
    currentDate.year,
    currentDate.month - 1,
    currentDate.day,
  );
  const originalMonth = newDate.getMonth();

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
  const newDate = new Date(
    currentDate.year,
    currentDate.month - 1,
    currentDate.day,
  );
  const originalMonth = newDate.getMonth();

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
  abbreviated = false,
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
 * @param returnArray If true, return an array of sessions without IDs. If false,
 *  simply subset the drinking session list to the relevant sessions.
 * @returns The subsetted array of sessions
 */
export function getSingleDayDrinkingSessions(
  date: Date,
  sessions: DrinkingSessionList | undefined,
  returnArray = true,
): DrinkingSessionArray | DrinkingSessionList {
  // This is without timezones
  const sessionBelongsToDate = (session: DrinkingSession) => {
    const tz = session.timezone ?? timezone.selected;
    const sessionDate = formatInTimeZone(session.start_time, tz, 'yyyy-MM-dd');
    return sessionDate === format(date, 'yyyy-MM-dd');
  };

  if (returnArray) {
    return _.filter(sessions, session => sessionBelongsToDate(session));
  }

  return _.entries(sessions)
    .filter(([sessionId, session]) => sessionBelongsToDate(session))
    .reduce((acc, [sessionId, session]) => {
      acc[sessionId] = session;
      return acc;
    }, {} as DrinkingSessionList);
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
  untilToday = false,
) {
  const startDate = startOfMonth(date);
  const endDate = untilToday ? endOfToday() : endOfMonth(date);

  const monthDrinkingSessions = sessions.filter(session => {
    const tz = session.timezone ?? timezone.selected;
    const sessionDate = new Date(utcToZonedTime(session.start_time, tz));
    return sessionDate >= startDate && sessionDate <= endDate;
  });

  return monthDrinkingSessions;
}

export function aggregateSessionsByDays(
  sessions: DrinkingSession[],
  measureType: MeasureType = 'units',
  drinksToUnits?: DrinksToUnits,
): SessionsCalendarDatesType {
  return sessions.reduce(
    (acc: SessionsCalendarDatesType, item: DrinkingSession) => {
      const dateString = formatInTimeZone(
        item.start_time,
        item.timezone ?? timezone.selected,
        CONST.DATE.CALENDAR_FORMAT,
      );
      let newDrinks: number;
      if (measureType === 'units') {
        if (!drinksToUnits) {
          throw new Error('You must specify the drink to unit conversion');
        }
        newDrinks = DSUtils.calculateTotalUnits(item.drinks, drinksToUnits);
      } else if (measureType === 'drinks') {
        newDrinks = sumAllDrinks(item.drinks);
      } else {
        throw new Error('Unknown measure type');
      }
      acc[dateString] = acc[dateString]
        ? {
            // Already an entry exists
            units: acc[dateString].units + newDrinks, // Does not distinguish between drinks/units
            blackout: acc[dateString].blackout === false ? item.blackout : true,
          }
        : {
            // First entry
            units: newDrinks,
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
  const markedDates: SessionsCalendarMarkedDates = _.entries(sessions).reduce(
    (
      acc: SessionsCalendarMarkedDates,
      [key, {units: value, blackout: blackoutInfo}],
    ) => {
      const unitsToColorsInfo = preferences.units_to_colors;
      let color: CalendarColors = unitsToColors(value, unitsToColorsInfo);
      if (blackoutInfo === true) {
        color = 'black';
      }
      let textColor = 'black';
      if (color == 'red' ?? color == 'green' ?? color == 'black') {
        textColor = 'white';
      }
      const markingObject: DayMarking = {
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

/** Sum up all drinks regardless of category
 *
 * @param all_drinks Drinks to sum up.
 */
export function sumAllDrinks(drinks: DrinksList | undefined): number {
  if (isEmptyObject(drinks)) {
    return 0;
  }
  return Object.values(drinks).reduce((total, drinkTypes) => {
    return (
      total +
      Object.values(drinkTypes).reduce(
        (subTotal, drinkCount) => subTotal + (drinkCount ?? 0),
        0,
      )
    );
  }, 0);
}

/** Sum up drinks of a specific type of alcohol across multiple sessions
 *
 * @param drinksOjbect DrinksList to sum up.
 * @param drinkType The type of drink to sum.
 */
export function sumDrinksOfSingleType(
  drinksObject: DrinksList | undefined,
  drinkType: DrinkKey,
): number {
  if (!drinksObject) {
    return 0;
  }
  return _.reduce(
    drinksObject,
    (total, session) => total + (session[drinkType] ?? 0),
    0,
  );
}

/** Sum up drinks of a single Drink type object.
 *
 * @param drinkTypes A Drinks kind of object
 * @returns The sum
 */
export function sumDrinkTypes(drinkTypes: Drinks): number {
  if (!drinkTypes) {
    return 0;
  }
  return _.reduce(
    drinkTypes,
    (total, drinkCount) => total + (drinkCount ?? 0),
    0,
  );
}

/** Get an array of unique keys that appear in a session */
export function getUniqueDrinkTypesInSession(
  session: DrinkingSession,
): Array<DrinkKey> | undefined {
  const sessionDrinks = session?.drinks;
  if (!sessionDrinks) {
    return undefined;
  }
  const uniqueKeys = new Set<DrinkKey>();

  // Iterate over each Drinks entry in the DrinksList
  for (const drinks of Object.values(sessionDrinks)) {
    // Iterate over each DrinkKey in the current Drinks object
    for (const key of Object.keys(drinks) as DrinkKey[]) {
      uniqueKeys.add(key);
    }
  }

  // Convert the Set to an array before returning
  return Array.from(uniqueKeys);
}

// /** Using a DrinksList and the drinks to units conversion object, calculate how many units this object amounts to.
//  *
//  * @param drinksObject DrinksList type
//  * @param unitsToPoits Drinks to units conversion object
//  * @returns Number of points
//  *
//  * @example let points = sumAllUnits({
//  * [1694819284]: {'beer': 5},
//  * [1694819286]: {'wine': 2, 'cocktail': 1},
//  * }, DrinksToUnits)
//  */
// export function sumAllUnits(
//   drinksObject: DrinksList | undefined,
//   drinksToUnits: DrinksToUnits,
//   roundUp?: boolean,
// ): number {
//   if (_.isEmpty(drinksObject)) {
//     return 0;
//   }
//   let totalUnits = 0;
//   // Iterate over each timestamp in drinksObject
//   _.forEach(Object.values(drinksObject), drinkTypes => {
//     _.forEach(Object.keys(drinkTypes), DrinkKey => {
//       if (isDrinkTypeKey(DrinkKey)) {
//         const typeDrinks = drinkTypes[DrinkKey] ?? 0;
//         const typeUnits = drinksToUnits[DrinkKey] ?? 0;
//         totalUnits += typeDrinks * typeUnits;
//       }
//     });
//   });
//   if (roundUp) {
//     return roundToTwoDecimalPlaces(totalUnits);
//   }
//   return totalUnits;
// }

/** Input a session item and return the timestamp of the last drink
 * consumed in that session.
 *
 * @param session Drinking session array item
 * @returnsTimestamp of the last drink consumed
 */
export function getLastDrinkAddedTime(session: DrinkingSession): number | null {
  if (_.isEmpty(session?.drinks)) {
    return null;
  }
  const timestamps = _.map(Object.keys(session.drinks), Number);
  // Return the maximum timestamp or null if there aren't any
  return timestamps.length ? Math.max(...timestamps) : null;
}

/** Out of an array of session items, return an a session that is ongoing. If there is no such session, return null
 */
export function findOngoingSession(
  sessions: DrinkingSessionList,
): DrinkingSession | null {
  if (isEmptyObject(sessions)) {
    return null;
  }
  const ongoingSession = Object.values(sessions).find(
    session => session.ongoing === true,
  );
  return ongoingSession ? ongoingSession : null;
}

/** Enter a dateObject and an array of drinking sessions and calculate
 * drinks consumed in the current month.
 *
 * @param dateObject DateObject
 * @param sessions Array of drinking sessions
 * @returns Number of drinks consumed during the current month
 */
export const calculateThisMonthDrinks = (
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
    (sum, session) => sum + sumAllDrinks(session.drinks),
    0,
  );
};

/** Enter a dateObject and an array of drinking sessions and calculate
 * units for drinks consumed in the current month.
 *
 * @param dateObject DateObject
 * @param sessions Array of drinking sessions
 * @param drinksToUnits Drinks to units conversion object
 * @returns Number of units consumed during the current month
 */
export const calculateThisMonthUnits = (
  dateObject: DateObject,
  sessions: DrinkingSessionArray,
  drinksToUnits: DrinksToUnits,
): number => {
  if (!sessions) {
    return 0;
  }
  // Subset to this month's sessions only
  const currentDate = timestampToDate(dateObject.timestamp);
  const sessionsThisMonth = getSingleMonthDrinkingSessions(
    currentDate,
    sessions,
    false,
  );
  // Sum up the drinks
  return sessionsThisMonth.reduce(
    (sum, session) =>
      sum + DSUtils.calculateTotalUnits(session.drinks, drinksToUnits),
    0,
  );
};

export function getLastStartedSession(
  sessions: DrinkingSessionList | undefined,
): DrinkingSession | undefined {
  if (!sessions) {
    return undefined;
  }
  return _.maxBy(_.values(sessions), 'start_time');
}

export function getLastStartedSessionId(
  sessions: DrinkingSessionList | undefined,
): string | undefined {
  if (!sessions) {
    return undefined;
  }

  const latestSession = _.maxBy(
    _.entries(sessions),
    ([, sessionValue]) => sessionValue.start_time,
  );

  // Return the key (session ID) of the latest session, if it exists
  return latestSession ? latestSession[0] : undefined;
}

/** Generate an object with all available drinks where
 * each drink's value is set to a random integer.
 */

export const getRandomDrinksList = (maxDrinkValue = 30): DrinksList => {
  const drinkWithRandomValues: Drinks = {};

  // Loop over each item in DrinkTypesKeys and set its value to a random number between 0 and maxDrinkValue
  for (const key of Object.values(CONST.DRINKS.KEYS)) {
    drinkWithRandomValues[key] = getRandomInt(0, maxDrinkValue);
  }

  // Create a new object with a current timestamp
  const timestamp = Date.now();
  const result: DrinksList = {
    [timestamp]: drinkWithRandomValues,
  };

  return result;
};

/** Generate an object with all available drinks where each drink's value is set to 0.
 */
export function getZeroDrinksList(): DrinksList {
  return getRandomDrinksList(0);
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

/** Insert the key of a drink and find its matching verbose name.
 *
 * @returns The verbose name of that drink.
 */
export const findDrinkName = (key: DrinkKey): DrinkName | undefined => {
  const drinkIdx = Object.values(CONST.DRINKS.KEYS).findIndex(
    type => type === key,
  );
  if (drinkIdx === -1) {
    return undefined;
  }
  return Object.values(CONST.DRINKS.NAMES)[drinkIdx];
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
