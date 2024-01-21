import {
  addUnits,
  calculateThisMonthPoints,
  calculateThisMonthUnits,
  changeDateBySomeDays,
  dateToDateObject,
  findUnitName,
  formatDate,
  formatDateToDay,
  formatDateToTime,
  getAdjacentMonths,
  getLastUnitAddedTime,
  getNextMonth,
  getPreviousMonth,
  getRandomUnitsObject,
  getSingleDayDrinkingSessions,
  getSingleMonthDrinkingSessions,
  getTimestampAtMidnight,
  getTimestampAtNoon,
  getYearMonth,
  getYearMonthVerbose,
  getZeroUnitsObject,
  removeUnits,
  removeZeroObjectsFromSession,
  setDateToCurrentTime,
  sumAllPoints,
  sumAllUnits,
  sumUnitTypes,
  sumUnitsOfSingleType,
  timestampToDate,
  unitsToColors,
} from '../../../src/utils/dataHandling';
import {DateObject} from '../../../src/types/components';
import {
  DrinkingSessionArrayItem,
  DrinkingSessionData,
  PreferencesData,
  UnitTypesKeys,
  UnitTypesNames,
  UnitTypesProps,
  UnitsObject,
  UnitsToColorsData,
} from '../../../src/types/database';
import {
  createMockPreferences,
  createMockSession,
  createMockUnitsObject,
} from '../../utils/mockDatabase';
import CONST from '@src/CONST';

describe('formatDate function', () => {
  function checkFormattedDate(date: Date, expectedFormattedDate: string) {
    const formattedDate = formatDate(date);
    expect(formattedDate).toEqual(expectedFormattedDate);
    expect(typeof formattedDate).toBe('string');
  }

  it('formats an arbitrary date', () => {
    checkFormattedDate(new Date(2023, 7, 18), '2023-08-18');
  });

  it('formats the first day of the year', () => {
    checkFormattedDate(new Date(2022, 0, 1), '2022-01-01');
  });

  it('formats the last day of the year', () => {
    checkFormattedDate(new Date(2024, 11, 31), '2024-12-31');
  });
});

describe('formatDateToDay function', () => {
  function checkFormattedDay(date: Date, expectedFormattedDay: string) {
    const formattedDay = formatDateToDay(date);
    expect(formattedDay).toEqual(expectedFormattedDay);
    expect(typeof formattedDay).toBe('string');
  }

  it('formats an arbitrary date to its day', () => {
    checkFormattedDay(new Date(2023, 7, 18), '08-18');
  });

  it('formats the first day of the year to its day', () => {
    checkFormattedDay(new Date(2022, 0, 1), '01-01');
  });

  it('formats the last day of the year to its day', () => {
    checkFormattedDay(new Date(2024, 11, 31), '12-31');
  });
});

describe('formatDateToTime function', () => {
  function checkFormattedTime(date: Date, expectedFormattedTime: string) {
    const formattedTime = formatDateToTime(date);
    expect(formattedTime).toEqual(expectedFormattedTime);
    expect(typeof formattedTime).toBe('string');
  }

  it('formats an arbitrary date to its time', () => {
    const date = new Date(2023, 7, 18, 16, 20);
    checkFormattedTime(date, '16:20');
  });

  it('formats a date with hours/minutes starting with 0 to its time', () => {
    const date = new Date(2023, 7, 18, 1, 1);
    checkFormattedTime(date, '01:01');
  });

  it('formats a date at midnight to its time', () => {
    const date = new Date(2023, 7, 18, 0, 0);
    checkFormattedTime(date, '00:00');
  });
});

describe('timestampToDate function', () => {
  function checkTimestampToDateConversion(timestamp: number) {
    const convertedDate = timestampToDate(timestamp);
    expect(convertedDate.getTime()).toEqual(timestamp);
    expect(convertedDate).toBeInstanceOf(Date);
  }

  it('converts a timestamp to a Date object', () => {
    const currentTimestamp = new Date().getTime();
    checkTimestampToDateConversion(currentTimestamp);
  });
});

describe('dateTodateObject function', () => {
  function checkDateObjectProperties(date: Date, dateObject: any) {
    const formattedDate = formatDate(date);
    expect(dateObject.dateString).toEqual(formattedDate);
    expect(dateObject.day).toEqual(date.getDate());
    expect(dateObject.month - 1).toEqual(date.getMonth()); // Adjusting for 1-indexed month
    expect(dateObject.year).toEqual(date.getFullYear());
    expect(dateObject.timestamp).toEqual(date.getTime());
  }

  it('converts a Date object to its corresponding DateObject', () => {
    const today = new Date();
    const dateObject = dateToDateObject(today);
    checkDateObjectProperties(today, dateObject);
  });
});

describe('getTimestampAtMidnight function', () => {
  function checkTimePropertiesForMidnight(date: Date) {
    expect(date.getHours()).toEqual(0);
    expect(date.getMinutes()).toEqual(0);
    expect(date.getSeconds()).toEqual(0);
    expect(date.getMilliseconds()).toEqual(0);
  }

  it('creates a timestamp corresponding to midnight of a given date', () => {
    const today = new Date();
    const timestampAtMidnight = getTimestampAtMidnight(today);
    const midnightDate = timestampToDate(timestampAtMidnight);
    checkTimePropertiesForMidnight(midnightDate);
    expect(midnightDate.getDate()).toEqual(today.getDate());
  });
});

describe('getTimestampAtNoon function', () => {
  function checkTimePropertiesForNoon(date: Date) {
    expect(date.getHours()).toEqual(12);
    expect(date.getMinutes()).toEqual(0);
    expect(date.getSeconds()).toEqual(0);
    expect(date.getMilliseconds()).toEqual(0);
  }

  it('creates a timestamp corresponding to noon of a given date', () => {
    const today = new Date();
    const timestampAtNoon = getTimestampAtNoon(today);
    const noonDate = timestampToDate(timestampAtNoon);
    checkTimePropertiesForNoon(noonDate);
    expect(noonDate.getDate()).toEqual(today.getDate());
  });
});

describe('changeDateBySomeDays function', () => {
  function checkDateValues(
    actualDate: Date,
    expectedYear: number,
    expectedMonth: number,
    expectedDay: number,
  ) {
    expect(actualDate).toBeInstanceOf(Date);
    expect(actualDate.getFullYear()).toEqual(expectedYear);
    expect(actualDate.getMonth() + 1).toEqual(expectedMonth); // Month is 0-based
    expect(actualDate.getDate()).toEqual(expectedDay);
  }

  it('adds a positive number of days', () => {
    const originalDate = new Date(2023, 7, 15); // 15th August 2023
    const newDate = changeDateBySomeDays(originalDate, 10);
    checkDateValues(newDate, 2023, 8, 25); // Expected: 25th August 2023
  });

  it('subtracts days', () => {
    const originalDate = new Date(2023, 7, 15); // 15th August 2023
    const newDate = changeDateBySomeDays(originalDate, -10);
    checkDateValues(newDate, 2023, 8, 5); // Expected: 5th August 2023
  });

  it('handles month rollover when adding days', () => {
    const originalDate = new Date(2023, 7, 25); // 25th August 2023
    const newDate = changeDateBySomeDays(originalDate, 10);
    checkDateValues(newDate, 2023, 9, 4); // Expected: 4th September 2023
  });

  it('handles month rollback when subtracting days', () => {
    const originalDate = new Date(2023, 7, 5); // 5th August 2023
    const newDate = changeDateBySomeDays(originalDate, -10);
    checkDateValues(newDate, 2023, 7, 26); // Expected: 26th July 2023
  });

  it('handles year change when adding days', () => {
    const originalDate = new Date(2023, 11, 30); // 30th December 2023
    const newDate = changeDateBySomeDays(originalDate, 5);
    checkDateValues(newDate, 2024, 1, 4); // Expected: 4th January 2024
  });

  it('handles year change when subtracting days', () => {
    const originalDate = new Date(2024, 0, 5); // 5th January 2024
    const newDate = changeDateBySomeDays(originalDate, -10);
    checkDateValues(newDate, 2023, 12, 26); // Expected: 26th December 2023
  });
});

describe('getNextMonth function', () => {
  function checkIsDateAndHasExpectedValues(
    acualDate: DateObject,
    expectedDay: number,
    expectedMonth: number,
  ) {
    const date = new Date(acualDate.timestamp);
    expect(date).toBeInstanceOf(Date);
    expect(acualDate.day).toEqual(expectedDay);
    expect(acualDate.month).toEqual(expectedMonth);
    expect(acualDate.dateString).toEqual(
      `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
    );
  }

  it('shifts a mid-month date to the same day of the next month', () => {
    const originalDateObj: DateObject = dateToDateObject(new Date(2023, 7, 15));
    const newDateObj = getNextMonth(originalDateObj);
    checkIsDateAndHasExpectedValues(newDateObj, 15, 9); // Expected: September 15
  });

  it('shifts an end-of-month date (with 31 days) to the last day of the next month (with 30 days)', () => {
    const originalDateObj: DateObject = dateToDateObject(new Date(2023, 6, 31));
    const newDate = getNextMonth(originalDateObj);
    checkIsDateAndHasExpectedValues(newDate, 31, 8); // Expected: August 31 (as August has 31 days)
  });

  it('shifts an end-of-month date (with 31 days) to the last day of the next month (with 28/29 days)', () => {
    const originalDateObj: DateObject = dateToDateObject(new Date(2023, 0, 31));
    const newDate = getNextMonth(originalDateObj);
    checkIsDateAndHasExpectedValues(newDate, 28, 2); // Expected: February 28 (non-leap year)
  });

  it('shifts an end-of-month date (with 31 days) to the last day of the next month (in a leap year)', () => {
    const originalDateObj: DateObject = dateToDateObject(new Date(2024, 0, 31));
    const newDate = getNextMonth(originalDateObj);
    checkIsDateAndHasExpectedValues(newDate, 29, 2); // Expected: February 29 (leap year)
  });

  it('shifts an end-of-month date (with 30 days) to the same day of the next month (with 31 days)', () => {
    const originalDateObj: DateObject = dateToDateObject(new Date(2023, 3, 30));
    const newDate = getNextMonth(originalDateObj);
    checkIsDateAndHasExpectedValues(newDate, 30, 5); // Expected: May 30 (as May has 31 days)
  });
});

describe('getYearMonth', () => {
  it('should correctly format year and month for valid dates', () => {
    const testCases: {input: Date; expected: string}[] = [
      {input: new Date(2023, 7), expected: '2023-08'}, // 0-indexed vs 1-indexed
      {input: new Date(2021, 1), expected: '2021-02'},
      {input: new Date(1999, 11), expected: '1999-12'},
      {input: new Date(2000, 0), expected: '2000-01'},
    ];

    testCases.forEach(({input, expected}) => {
      let dateObject = dateToDateObject(input);
      expect(getYearMonth(dateObject)).toBe(expected);
    });
  });

  it('should handle month values with single digits', () => {
    const dateObject: DateObject = dateToDateObject(new Date(2023, 4));
    expect(getYearMonth(dateObject)).toBe('2023-05');
  });

  it('should handle month values with two digits', () => {
    const dateObject: DateObject = dateToDateObject(new Date(2023, 9));
    expect(getYearMonth(dateObject)).toBe('2023-10');
  });
});

describe('getYearMonthVerbose', () => {
  it('should return full month name by default', () => {
    const date: DateObject = dateToDateObject(new Date(2023, 9));
    expect(getYearMonthVerbose(date)).toBe('October 2023');
  });

  it('should return abbreviated month name when specified', () => {
    const date: DateObject = dateToDateObject(new Date(2023, 9));
    expect(getYearMonthVerbose(date, true)).toBe('Oct 2023');
  });

  it('should handle all months correctly', () => {
    for (let i = 0; i < 12; i++) {
      const date: DateObject = dateToDateObject(new Date(2023, i));
      expect(getYearMonthVerbose(date)).toBe(`${CONST.MONTHS[i]} 2023`);
      expect(getYearMonthVerbose(date, true)).toBe(
        `${CONST.MONTHS_ABBREVIATED[i]} 2023`,
      );
    }
  });
});

describe('getPreviousMonth function', () => {
  function checkDateValues(
    actualDate: DateObject,
    expectedYear: number,
    expectedMonth: number,
    expectedDay: number,
  ) {
    const date = new Date(actualDate.timestamp);
    expect(date).toBeInstanceOf(Date);
    expect(actualDate).toBeDefined();
    expect(actualDate.year).toEqual(expectedYear);
    expect(actualDate.month).toEqual(expectedMonth); // Month is 1-based in DateObject
    expect(actualDate.day).toEqual(expectedDay);
    expect(actualDate.dateString).toEqual(
      `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
    );
  }

  it('handles normal month rollback', () => {
    const originalDateObj: DateObject = dateToDateObject(new Date(2023, 7, 15));
    const newDate = getPreviousMonth(originalDateObj);
    checkDateValues(newDate, 2023, 7, 15); // Expected: 15th July 2023
  });

  it('handles end-of-month to month with fewer days (31 to 30)', () => {
    const originalDateObj: DateObject = dateToDateObject(new Date(2023, 7, 31));
    const newDate = getPreviousMonth(originalDateObj);
    checkDateValues(newDate, 2023, 7, 31); // Expected: 31st July 2023
  });

  it('handles end-of-month to month with fewer days (31 to 28)', () => {
    const originalDateObj: DateObject = dateToDateObject(new Date(2023, 2, 31));
    const newDate = getPreviousMonth(originalDateObj);
    checkDateValues(newDate, 2023, 2, 28); // Expected: 28th February 2023 (non-leap year)
  });

  it('handles end-of-month to month with fewer days (31 to 29 in leap year)', () => {
    const originalDateObj: DateObject = dateToDateObject(new Date(2024, 2, 31));
    const newDate = getPreviousMonth(originalDateObj);
    checkDateValues(newDate, 2024, 2, 29); // Expected: 29th February 2024 (leap year)
  });

  it('handles year change', () => {
    const originalDateObj: DateObject = dateToDateObject(new Date(2024, 0, 1));
    const newDate = getPreviousMonth(originalDateObj);
    checkDateValues(newDate, 2023, 12, 1); // Expected: 1st December 2023
  });
});

describe('setDateToCurrentTime function', () => {
  it('should change the time to current while keeping the date component the same', () => {
    const inputDate = new Date(2023, 7, 15, 5, 5, 5); // 15th August 2023, 05:05:05
    const modifiedDate = setDateToCurrentTime(inputDate);

    const currentTime = new Date();

    expect(modifiedDate.getFullYear()).toEqual(2023);
    expect(modifiedDate.getMonth()).toEqual(7);
    expect(modifiedDate.getDate()).toEqual(15);
    expect(modifiedDate.getHours()).toEqual(currentTime.getHours());
    expect(modifiedDate.getMinutes()).toEqual(currentTime.getMinutes());
    expect(modifiedDate.getSeconds()).toEqual(currentTime.getSeconds());
    expect(modifiedDate.getMilliseconds()).toEqual(
      currentTime.getMilliseconds(),
    );
  });
});

describe('getSingleDayDrinkingSessions', () => {
  it('should return sessions that only fall within the given date', () => {
    const baseDate = new Date('2023-08-20');
    const testSessions: DrinkingSessionArrayItem[] = [
      createMockSession(baseDate, 0), // Session from 'today'
      createMockSession(baseDate, -1), // Session from 'yesterday'
      createMockSession(baseDate, 1), // Session from 'tomorrow'
    ];

    const result = getSingleDayDrinkingSessions(baseDate, testSessions);
    expect(result).toHaveLength(1);
  });

  it('should return an empty array if no sessions fall within the given date', () => {
    const baseDate = new Date('2023-08-22');
    const testSessions: DrinkingSessionArrayItem[] = [
      createMockSession(baseDate, -2),
      createMockSession(baseDate, -3),
    ];

    const result = getSingleDayDrinkingSessions(baseDate, testSessions);
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

describe('getSingleMonthDrinkingSessions', () => {
  it('should return sessions that only fall within the given month', () => {
    const baseDate = new Date('2023-08-20');
    const testSessions: DrinkingSessionArrayItem[] = [
      createMockSession(baseDate, 0), // Session from this month
      createMockSession(baseDate, -30), // Session from last month
      createMockSession(baseDate, 30), // Session from next month
    ];

    const result = getSingleMonthDrinkingSessions(baseDate, testSessions);
    expect(result).toHaveLength(1);
  });

  it('should return sessions until today when untilToday flag is true', () => {
    const baseDate = new Date('2023-08-20');
    const futureSessionDate = new Date();
    futureSessionDate.setDate(futureSessionDate.getDate() + 5); // A session 5 days into the future

    const testSessions: DrinkingSessionArrayItem[] = [
      createMockSession(baseDate, 0), // Session from this month
      {
        ...createMockSession(baseDate, 0),
        start_time: futureSessionDate.getTime(),
      },
    ];

    const result = getSingleMonthDrinkingSessions(baseDate, testSessions, true);
    expect(result).toHaveLength(1);
  });

  it('should return an empty array if no sessions fall within the given month', () => {
    const baseDate = new Date('2023-08-22');
    const testSessions: DrinkingSessionArrayItem[] = [
      createMockSession(baseDate, -60),
      createMockSession(baseDate, -90),
    ];

    const result = getSingleMonthDrinkingSessions(baseDate, testSessions);
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

describe('sumAllUnits', () => {
  it('should correctly sum up all units of alcohol', () => {
    const sampleUnits: UnitsObject = getRandomUnitsObject();

    const result = sumAllUnits(sampleUnits);
    const expectedSum = Object.values(sampleUnits).reduce(
      (total, unitTypes) => {
        return (
          total +
          Object.values(unitTypes).reduce(
            (subTotal, unitCount) => subTotal + (unitCount || 0),
            0,
          )
        );
      },
      0,
    );
    expect(result).toBe(expectedSum);
  });

  it('should return 0 if all units are 0', () => {
    const zeroUnits = getZeroUnitsObject();
    const result = sumAllUnits(zeroUnits);
    expect(result).toBe(0);
  });
});

describe('sumUnitsOfSingleType function', () => {
  let unitsData: UnitsObject;

  beforeEach(() => {
    unitsData = {
      1632423423: {
        beer: 2,
        cocktail: 1,
        other: 3,
      },
      1632434223: {
        other: 3,
      },
    };
  });

  it('should return sum of specified unit type across all sessions', () => {
    expect(sumUnitsOfSingleType(unitsData, 'beer')).toBe(2);
    expect(sumUnitsOfSingleType(unitsData, 'cocktail')).toBe(1);
    expect(sumUnitsOfSingleType(unitsData, 'other')).toBe(6);
  });

  it('should return 0 if unit type does not exist in any of the sessions', () => {
    expect(sumUnitsOfSingleType(unitsData, 'wine')).toBe(0);
  });

  it('should return 0 if unitsObject is empty', () => {
    const emptyUnitsData: UnitsObject = {};
    expect(sumUnitsOfSingleType(emptyUnitsData, 'beer')).toBe(0);
  });

  it('should handle a mix of existing and non-existing unit types', () => {
    unitsData[1632434223].wine = 5;
    expect(sumUnitsOfSingleType(unitsData, 'wine')).toBe(5);
  });

  it('should handle undefined values without throwing errors', () => {
    unitsData[1632434223] = {
      beer: undefined,
      wine: 5,
    };
    expect(sumUnitsOfSingleType(unitsData, 'beer')).toBe(2);
  });
});

describe('sumUnitTypes', () => {
  it('should correctly sum units of multiple types', () => {
    let testUnits = {
      beer: 2,
      cocktail: 1,
      wine: 3,
    };

    const result = sumUnitTypes(testUnits);
    expect(result).toBe(6);
  });

  it('should return 0 for an empty units object', () => {
    let testUnits = {};

    const result = sumUnitTypes(testUnits);
    expect(result).toBe(0);
  });

  it('should handle missing unit types correctly', () => {
    let testUnits = {
      beer: 2,
      wine: 3,
      // No cocktail, strong_shot, weak_shot, or other
    };

    const result = sumUnitTypes(testUnits);
    expect(result).toBe(5);
  });

  it('should treat undefined unit counts as 0', () => {
    let testUnits = {
      beer: 2,
      cocktail: undefined,
      wine: 3,
    };

    const result = sumUnitTypes(testUnits);
    expect(result).toBe(5);
  });
});

describe('sumAllPoints', () => {
  // Helper to get a random UnitsObject for testing purposes
  // function getRandomPointsUnitsObject(): [UnitsObject, UnitTypesProps] {
  // }
  // Test for all units and point conversion metrics present

  it('should return 0 if all units are 0', () => {
    const zeroUnits: UnitsObject = {
      1632423423: {
        beer: 0,
        cocktail: 0,
        other: 0,
      },
      1632434223: {
        beer: 0,
      },
    };
    const zeroPoints: UnitTypesProps = {
      beer: 0,
      cocktail: 0,
      other: 0,
      strong_shot: 0,
      weak_shot: 0,
      wine: 0,
    };
    const result = sumAllPoints(zeroUnits, zeroPoints);
    expect(result).toBe(0);
  });

  it('should correctly handle missing keys in UnitsObject', () => {
    const partialUnits: UnitsObject = {
      1632423423: {
        beer: 2,
        cocktail: 1,
      },
      1632434223: {
        other: 3,
      },
    };
    const samplePoints: UnitTypesProps = {
      beer: 5,
      cocktail: 10,
      other: 1,
      strong_shot: 15,
      weak_shot: 5,
      wine: 7,
    };
    const result = sumAllPoints(partialUnits, samplePoints);
    expect(result).toBe(2 * 5 + 1 * 10 + 3 * 1);
  });

  it('should correctly handle missing keys in unitsToPoints', () => {
    const sampleUnits: UnitsObject = {
      1632423423: {
        beer: 2,
        cocktail: 1,
      },
      1632434223: {
        other: 3,
      },
    };
    const partialPoints: UnitTypesProps = {
      beer: 5,
      other: 1,
    };
    const result = sumAllPoints(sampleUnits, partialPoints);
    expect(result).toBe(2 * 5 + 1 * 0 + 3 * 1); // cocktail has a missing key in unitsToPoints, so its value is considered 0
  });
});

describe('getLastUnitAddedTime', () => {
  let dateNow: Date = new Date();
  let mockSession: DrinkingSessionArrayItem;

  beforeEach(() => {
    mockSession = createMockSession(dateNow);
  });

  it('should correctly identify last added unit timestamp', () => {
    let now = dateNow.getTime();
    let testUnits: UnitsObject = {
      [now + 10]: {
        beer: 2,
      },
      [now + 20]: {
        wine: 3,
        other: 1,
      },
    };
    mockSession.units = testUnits;

    const lastUnitAddedTime = getLastUnitAddedTime(mockSession);
    expect(lastUnitAddedTime).toBe(now + 20);
  });

  it('should return null for an empty units object', () => {
    let testUnits = {};
    mockSession.units = testUnits;

    const result = getLastUnitAddedTime(mockSession);
    expect(result).toBe(null);
  });
});

describe('calculateThisMonthUnits', () => {
  let currentDate = new Date();
  let mockDateObject: DateObject = dateToDateObject(currentDate);
  let twoBeers: UnitsObject = createMockUnitsObject({beer: 2});
  let threeWines: UnitsObject = createMockUnitsObject({wine: 3});
  let fourOther: UnitsObject = createMockUnitsObject({other: 4});

  it('should return 0 when there are no drinking sessions this month', () => {
    const result = calculateThisMonthUnits(mockDateObject, []);
    expect(result).toBe(0);
  });

  it('should sum units for sessions that only fall within the current month', () => {
    const testSessions: DrinkingSessionArrayItem[] = [
      createMockSession(new Date(), -31, twoBeers),
      createMockSession(new Date(), 31, twoBeers),
      createMockSession(new Date(), 0, threeWines),
      createMockSession(new Date(), 0, twoBeers),
    ];

    const result = calculateThisMonthUnits(mockDateObject, testSessions);
    expect(result).toBe(5); // 3 + 2
  });

  it('should sum units for all sessions if all fall within the current month', () => {
    // Mock sumAllUnits function and getSingleMonthDrinkingSessions to return an array of sessions
    const testSessions: DrinkingSessionArrayItem[] = [
      createMockSession(new Date(), 0, threeWines),
      createMockSession(new Date(), 0, twoBeers),
      createMockSession(new Date(), 0, fourOther),
    ];

    const result = calculateThisMonthUnits(mockDateObject, testSessions);
    expect(result).toBe(9); // 4 + 3 + 2
  });
});

describe('calculateThisMonthPoints', () => {
  let mockPreferences: PreferencesData = createMockPreferences();
  let mockUnitsToPoints = mockPreferences.units_to_points;
  mockUnitsToPoints.beer = 1;
  mockUnitsToPoints.weak_shot = 0.5;
  mockUnitsToPoints.other = 1;
  let currentDate = new Date();
  let mockDateObject: DateObject = dateToDateObject(currentDate);
  let twoBeers: UnitsObject = createMockUnitsObject({beer: 2});
  let threeWeakShots: UnitsObject = createMockUnitsObject({weak_shot: 3});
  let fourOther: UnitsObject = createMockUnitsObject({other: 4});

  it('should return 0 when there are no drinking sessions this month', () => {
    const result = calculateThisMonthPoints(
      mockDateObject,
      [],
      mockUnitsToPoints,
    );
    expect(result).toBe(0);
  });

  it('should sum units for sessions that only fall within the current month', () => {
    const testSessions: DrinkingSessionArrayItem[] = [
      createMockSession(new Date(), -31, twoBeers),
      createMockSession(new Date(), 31, twoBeers),
      createMockSession(new Date(), 0, threeWeakShots),
      createMockSession(new Date(), 0, twoBeers),
    ];

    const result = calculateThisMonthPoints(
      mockDateObject,
      testSessions,
      mockUnitsToPoints,
    );
    expect(result).toBe(3.5); // 3 * 0.5 + 2 * 1
  });

  it('should sum units for all sessions if all fall within the current month', () => {
    // Mock sumAllUnits function and getSingleMonthDrinkingSessions to return an array of sessions
    const testSessions: DrinkingSessionArrayItem[] = [
      createMockSession(new Date(), 0, threeWeakShots),
      createMockSession(new Date(), 0, twoBeers),
      createMockSession(new Date(), 0, fourOther),
    ];

    const result = calculateThisMonthPoints(
      mockDateObject,
      testSessions,
      mockUnitsToPoints,
    );
    expect(result).toBe(7.5); // 3 * 0.5 + 2 * 1 + 4 * 1
  });
});

describe('addUnits function', () => {
  let existingUnits: UnitsObject;

  beforeEach(() => {
    existingUnits = {
      1632423423: {
        beer: 2,
        cocktail: 1,
        other: 3,
      },
      1632434223: {
        other: 3,
      },
    };
  });

  it('should add new units with a new timestamp', () => {
    const unitsToAdd: UnitTypesProps = {beer: 4, wine: 2};
    const newUnits = addUnits(existingUnits, unitsToAdd);
    const newTimestamps = Object.keys(newUnits).map(Number);

    // Expect that there is one more session than before
    expect(newTimestamps.length).toBe(Object.keys(existingUnits).length + 1);

    // Expect the most recent session data to match unitsToAdd
    const mostRecentTimestamp = Math.max(...newTimestamps);
    expect(newUnits[mostRecentTimestamp]).toEqual(unitsToAdd);
  });

  it('should keep all existing units unchanged', () => {
    const unitsToAdd: UnitTypesProps = {beer: 4, wine: 2};
    const newUnits = addUnits(existingUnits, unitsToAdd);

    Object.keys(existingUnits).forEach(timestamp => {
      expect(newUnits[Number(timestamp)]).toEqual(
        existingUnits[Number(timestamp)],
      );
    });
  });

  it('should handle empty units to add', () => {
    const unitsToAdd: UnitTypesProps = {};
    const newUnits = addUnits(existingUnits, unitsToAdd);
    const newTimestamps = Object.keys(newUnits).map(Number);

    // Expect that there is one more session than before
    expect(newTimestamps.length).toBe(Object.keys(existingUnits).length + 1);

    // Expect the most recent session data to be empty
    const mostRecentTimestamp = Math.max(...newTimestamps);
    expect(newUnits[mostRecentTimestamp]).toEqual(unitsToAdd);
  });

  it('should handle undefined values in units to add', () => {
    const unitsToAdd: UnitTypesProps = {beer: undefined, wine: 2};
    const newUnits = addUnits(existingUnits, unitsToAdd);
    const newTimestamps = Object.keys(newUnits).map(Number);

    // Expect that there is one more session than before
    expect(newTimestamps.length).toBe(Object.keys(existingUnits).length + 1);

    // Expect the most recent session data to match unitsToAdd
    const mostRecentTimestamp = Math.max(...newTimestamps);
    expect(newUnits[mostRecentTimestamp]).toEqual(unitsToAdd);
  });
});

describe('removeUnits function', () => {
  let existingUnits: UnitsObject;

  beforeEach(() => {
    existingUnits = {
      1632423423: {
        beer: 4,
        cocktail: 2,
      },
      1632434223: {
        beer: 3,
      },
      1632435223: {
        cocktail: 1,
      },
    };
  });

  it('should remove units starting from the most recent session', () => {
    const newUnits = removeUnits(existingUnits, 'beer', 5);
    expect(newUnits[1632434223]).toBeUndefined();
    expect(newUnits[1632423423]?.beer).toBe(2);
  });

  it('should remove all units if the count equals the total', () => {
    const newUnits = removeUnits(existingUnits, 'beer', 7);
    expect(newUnits[1632434223]).toBeUndefined();
    expect(newUnits[1632423423]?.beer).toBeUndefined();
  });

  it('should handle removing more units than exist', () => {
    const newUnits = removeUnits(existingUnits, 'beer', 10);
    expect(newUnits[1632434223]).toBeUndefined();
    expect(newUnits[1632423423]?.beer).toBeUndefined();
  });

  it('should not modify other unit types when removing units', () => {
    const newUnits = removeUnits(existingUnits, 'beer', 5);
    expect(newUnits[1632423423]?.cocktail).toBe(2);
    expect(newUnits[1632435223]?.cocktail).toBe(1);
    expect(sumUnitsOfSingleType(newUnits, 'cocktail')).toBe(3);
  });

  it('should remove 0 units if the count is 0', () => {
    const newUnits = removeUnits(existingUnits, 'beer', 0);
    expect(newUnits).toEqual(existingUnits);
  });

  // it('should handle undefined and zero values without throwing errors', () => {
  //   existingUnits[1632434223]!.beer = undefined;
  //   const newUnits = removeUnits(existingUnits, 'beer', 5);
  //   expect(newUnits[1632434223]).toBeUndefined();
  //   expect(newUnits[1632423423]?.beer).toBe(2);
  // });

  it('should clean up sessions that have zero units left', () => {
    const newUnits = removeUnits(existingUnits, 'cocktail', 3);
    expect(newUnits[1632423423]?.cocktail).toBeUndefined();
    expect(newUnits[1632435223]).toBeUndefined();
  });
});

describe('removeZeroObjectsFromSession', () => {
  // Helper function to create mock session with units
  const createMockSessionWithUnits = (
    units: UnitsObject,
  ): DrinkingSessionArrayItem => {
    return {
      start_time: Date.now(),
      end_time: Date.now() + 1000,
      blackout: false,
      note: '',
      units: units,
    };
  };

  it('should remove UnitsObject children with all unit values set to 0', () => {
    const mockSession: DrinkingSessionArrayItem = createMockSessionWithUnits({
      12345679: {
        beer: 0,
        cocktail: 0,
        other: 0,
        strong_shot: 0,
        weak_shot: 0,
        wine: 0,
      },
      12345680: {beer: 1},
    });

    const result = removeZeroObjectsFromSession(mockSession);
    expect(Object.keys(result.units)).toHaveLength(1);
    expect(sumAllUnits(result.units)).toEqual(1);
    expect(result.units[12345680]).toBeDefined();
  });

  it('should keep UnitsObject children with at least one unit value not set to 0', () => {
    const mockSession: DrinkingSessionArrayItem = createMockSessionWithUnits({
      12345679: {beer: 1, cocktail: 0},
      12345680: {beer: 0, wine: 1},
    });

    const result = removeZeroObjectsFromSession(mockSession);
    expect(Object.keys(result.units)).toHaveLength(2);
    expect(sumAllUnits(result.units)).toEqual(2);
    expect(result.units[12345679]).toBeDefined();
    expect(result.units[12345680]).toBeDefined();
  });

  it('should return the same session if no UnitsObject children have all unit values set to 0', () => {
    const mockSession: DrinkingSessionArrayItem = createMockSessionWithUnits({
      12345679: {beer: 1},
      12345680: {wine: 1},
    });

    const result = removeZeroObjectsFromSession(mockSession);
    expect(sumAllUnits(result.units)).toEqual(2);
    expect(result).toEqual(mockSession);
  });

  it('should return a session with no units if all UnitsObject children have all unit values set to 0', () => {
    const mockSession: DrinkingSessionArrayItem = createMockSessionWithUnits({
      12345679: {
        beer: 0,
        cocktail: 0,
        other: 0,
        strong_shot: 0,
        weak_shot: 0,
        wine: 0,
      },
      12345680: {
        beer: 0,
        cocktail: 0,
        other: 0,
        strong_shot: 0,
        weak_shot: 0,
        wine: 0,
      },
    });

    const result = removeZeroObjectsFromSession(mockSession);
    expect(sumAllUnits(result.units)).toEqual(0);
    expect(Object.keys(result.units)).toHaveLength(0);
  });
});

describe('getRandomUnitsObject', () => {
  let randomUnitsObject: UnitsObject = {};
  let randomUnits: UnitTypesProps = {};

  beforeEach(() => {
    randomUnitsObject = getRandomUnitsObject(30);
    randomUnits = Object.values(randomUnitsObject)[0];
  });

  it('should return an object with all values between 0 and maxUnitValue (exclusive)', () => {
    for (let unit in randomUnits) {
      expect(randomUnits[unit as keyof UnitTypesProps]).toBeGreaterThanOrEqual(
        0,
      );
      expect(randomUnits[unit as keyof UnitTypesProps]).toBeLessThanOrEqual(30);
    }
  });

  it('should have all the expected keys based on UnitTypesProps type', () => {
    const expectedKeys = UnitTypesKeys;

    expect(Object.keys(randomUnits)).toEqual(expectedKeys);
  });
});

describe('getZeroUnitsObject', () => {
  let zeroUnitsObject: UnitsObject = {};
  let zeroUnits: UnitTypesProps = {};

  beforeEach(() => {
    zeroUnitsObject = getZeroUnitsObject();
    zeroUnits = Object.values(zeroUnitsObject)[0];
  });

  it('should return an object with all values equal to 0', () => {
    for (let unit in zeroUnits) {
      expect(zeroUnits[unit as keyof UnitTypesProps]).toEqual(0);
    }
  });

  it('should have all the expected keys based on UnitTypesProps type', () => {
    const expectedKeys = UnitTypesKeys;

    expect(Object.keys(zeroUnits)).toEqual(expectedKeys);
  });
});

describe('unitsToColors', () => {
  // Create a mock for UnitsToColorsData for consistent testing
  const mockUnitsToColorsData: UnitsToColorsData = {
    yellow: 2,
    orange: 4,
  };

  it('should return green for 0 units', () => {
    expect(unitsToColors(0, mockUnitsToColorsData)).toBe('green');
  });

  it('should return yellow for units up to yellow limit', () => {
    expect(unitsToColors(1, mockUnitsToColorsData)).toBe('yellow');
    expect(unitsToColors(2, mockUnitsToColorsData)).toBe('yellow');
  });

  it('should return orange for units between yellow and orange limits', () => {
    expect(unitsToColors(3, mockUnitsToColorsData)).toBe('orange');
    expect(unitsToColors(4, mockUnitsToColorsData)).toBe('orange');
  });

  it('should return red for units above the orange limit', () => {
    expect(unitsToColors(5, mockUnitsToColorsData)).toBe('red');
    expect(unitsToColors(6, mockUnitsToColorsData)).toBe('red');
  });
});

describe('findUnitName', () => {
  it('should return the verbose name for each unit key', () => {
    const verboseNames = UnitTypesNames;

    for (let unitKey of UnitTypesKeys) {
      const verboseName = findUnitName(unitKey);
      expect(verboseNames).toContain(verboseName);
    }
  });

  it('should return undefined for an invalid unit key', () => {
    const invalidUnitKey = 'invalid_key'; // This key doesn't exist in UnitTypesKeys
    const result = findUnitName(invalidUnitKey as any); // Type cast here to any to bypass TypeScript's type checking for the purpose of this test
    expect(result).toBeUndefined();
  });
});
