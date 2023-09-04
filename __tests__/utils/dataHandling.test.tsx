import { 
    calculateThisMonthUnits,
    changeDateBySomeDays,
    dateToDateObject, 
    formatDate,
    formatDateToDay,
    formatDateToTime,
    getNextMonth, 
    getPreviousMonth, 
    getRandomUnitsObject, 
    getSingleDayDrinkingSessions, 
    getSingleMonthDrinkingSessions, 
    getTimestampAtMidnight, 
    getTimestampAtNoon, 
    getZeroUnitsObject, 
    setDateToCurrentTime, 
    sumAllUnits, 
    sumUnitsOfSingleType, 
    timestampToDate, 
    unitsToColors
} from "../../src/utils/dataHandling";
import { DateObject } from "../../src/types/components";
import { DrinkingSessionArrayItem, DrinkingSessionData, UnitTypesKeys, UnitTypesProps, UnitsObject, UnitsToColorsData } from "../../src/types/database";


/** Generate a mock object of units
 * 
 * @usage const onlyWine = generateMockUnitsObject({ wine: 5 });
 */
function generateMockUnitsObject(units: Partial<UnitTypesProps> = {}): UnitsObject {
    let timestampNow = new Date().getTime();
    const defaultUnits: UnitsObject = {
      [timestampNow]: {
        beer: 0,
        cocktail: 0,
        other: 0,
        strong_shot: 0,
        weak_shot: 0,
        wine: 0,
      }
    };
  
    return {
      ...defaultUnits,
      ...units,
    };
};

/**
 * Generates a DrinkingSessionData for a specified offset relative to a given date.
 *
 * @param baseDate Date around which sessions are created.
 * @param offsetDays Number of days to offset from baseDate. If not provided, a random offset between -7 and 7 days is used.
 * @param units Units consumed during the session
 * @returns A DrinkingSessionData object.
 */
function generateMockSession(baseDate: Date, offsetDays?: number, units?: UnitsObject): DrinkingSessionArrayItem {
    if (!units){
        units = getZeroUnitsObject();
    };
    const sessionDate = new Date(baseDate);
  
    // If offsetDays is not provided, randomize between -7 and 7 days.
    const daysOffset = offsetDays !== undefined ? offsetDays : Math.floor(Math.random() * 15) - 7;
  
    sessionDate.setDate(sessionDate.getDate() + daysOffset);
  
    const startHour = 3;  // you can randomize this or make it configurable
  
    sessionDate.setHours(startHour, 0, 0, 0);

    const newSession:DrinkingSessionArrayItem =  {
        start_time: sessionDate.getTime(),
        end_time: sessionDate.getTime() + (2 * 60 * 60 * 1000),  // +2 hours
        units: units,
        blackout: false
    };
  
    return newSession;
  }


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

    it('generates a timestamp corresponding to midnight of a given date', () => {
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

    it('generates a timestamp corresponding to noon of a given date', () => {
        const today = new Date();
        const timestampAtNoon = getTimestampAtNoon(today);
        const noonDate = timestampToDate(timestampAtNoon);
        checkTimePropertiesForNoon(noonDate);
        expect(noonDate.getDate()).toEqual(today.getDate());
    });

});


describe('changeDateBySomeDays function', () => {

    function checkDateValues(actualDate: Date, expectedYear: number, expectedMonth: number, expectedDay: number) {
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

    function checkIsDateAndHasExpectedValues(acualDate: DateObject, expectedDay: number, expectedMonth: number) {
        const date = new Date(acualDate.timestamp);
        expect(date).toBeInstanceOf(Date);
        expect(acualDate.day).toEqual(expectedDay);
        expect(acualDate.month).toEqual(expectedMonth);
        expect(acualDate.dateString).toEqual(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`);
    };

    it('shifts a mid-month date to the same day of the next month', () => {
        const originalDateObj: DateObject = dateToDateObject(new Date(2023, 7, 15));
        const newDateObj = getNextMonth(originalDateObj);
        checkIsDateAndHasExpectedValues(newDateObj, 15, 9);  // Expected: September 15
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


describe('getPreviousMonth function', () => {

    function checkDateValues(actualDate: DateObject, expectedYear: number, expectedMonth: number, expectedDay: number) {
        const date = new Date(actualDate.timestamp);
        expect(date).toBeInstanceOf(Date);
        expect(actualDate).toBeDefined();
        expect(actualDate.year).toEqual(expectedYear);
        expect(actualDate.month).toEqual(expectedMonth); // Month is 1-based in DateObject
        expect(actualDate.day).toEqual(expectedDay);
        expect(actualDate.dateString).toEqual(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`);
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
        expect(modifiedDate.getMilliseconds()).toEqual(currentTime.getMilliseconds());
    });
});


describe('getSingleDayDrinkingSessions', () => {

    it('should return sessions that only fall within the given date', () => {
      const baseDate = new Date('2023-08-20');
      const testSessions: DrinkingSessionArrayItem[] = [
        generateMockSession(baseDate, 0),    // Session from 'today'
        generateMockSession(baseDate, -1),   // Session from 'yesterday'
        generateMockSession(baseDate, 1)     // Session from 'tomorrow'
      ];
  
      const result = getSingleDayDrinkingSessions(baseDate, testSessions);
      expect(result).toHaveLength(1);
    });
  
    it('should return an empty array if no sessions fall within the given date', () => {
      const baseDate = new Date('2023-08-22');
      const testSessions: DrinkingSessionArrayItem[] = [
        generateMockSession(baseDate, -2),
        generateMockSession(baseDate, -3)
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
        generateMockSession(baseDate, 0),   // Session from this month
        generateMockSession(baseDate, -30),  // Session from last month
        generateMockSession(baseDate, 30)    // Session from next month
      ];
  
      const result = getSingleMonthDrinkingSessions(baseDate, testSessions);
      expect(result).toHaveLength(1);
    });
  
    it('should return sessions until today when untilToday flag is true', () => {
      const baseDate = new Date('2023-08-20');
      const futureSessionDate = new Date();
      futureSessionDate.setDate(futureSessionDate.getDate() + 5);  // A session 5 days into the future
  
      const testSessions: DrinkingSessionArrayItem[] = [
        generateMockSession(baseDate, 0),   // Session from this month
        {
          ...generateMockSession(baseDate, 0),
          start_time: futureSessionDate.getTime()
        }
      ];
  
      const result = getSingleMonthDrinkingSessions(baseDate, testSessions, true);
      expect(result).toHaveLength(1);
    });
  
    it('should return an empty array if no sessions fall within the given month', () => {
      const baseDate = new Date('2023-08-22');
      const testSessions: DrinkingSessionArrayItem[] = [
        generateMockSession(baseDate, -60),
        generateMockSession(baseDate, -90)
      ];
  
      const result = getSingleMonthDrinkingSessions(baseDate, testSessions);
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
});


describe('sumAllUnits', () => {

    it('should correctly sum up all units of alcohol', () => {
        const sampleUnits:UnitsObject = getRandomUnitsObject();
        
        const result = sumAllUnits(sampleUnits);
        const expectedSum = Object.values(sampleUnits).reduce((total, unitTypes) => {
            return total + Object.values(unitTypes).reduce((subTotal, unitCount) => subTotal + (unitCount || 0), 0);
          }, 0);
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


describe('calculateThisMonthUnits', () => {
    let currentDate = new Date();
    let mockDateObject: DateObject = dateToDateObject(currentDate);
    let twoBeers: UnitsObject = generateMockUnitsObject({beer: 2});
    let threeWines: UnitsObject = generateMockUnitsObject({wine: 3});
    let fourOther: UnitsObject = generateMockUnitsObject({other: 4});
    
    it('should return 0 when there are no drinking sessions this month', () => {
      const result = calculateThisMonthUnits(mockDateObject, []);
      expect(result).toBe(0);
    });
  
    it('should sum units for sessions that only fall within the current month', () => {
      const testSessions: DrinkingSessionArrayItem[] = [
        generateMockSession(new Date(), -31, twoBeers),
        generateMockSession(new Date(), 31, twoBeers),
        generateMockSession(new Date(), 0, threeWines),
        generateMockSession(new Date(), 0, twoBeers),
      ];
      
      const result = calculateThisMonthUnits(mockDateObject, testSessions);
      expect(result).toBe(5);  // 3 + 2
    });
  
    it('should sum units for all sessions if all fall within the current month', () => {
      // Mock sumAllUnits function and getSingleMonthDrinkingSessions to return an array of sessions
      const testSessions: DrinkingSessionArrayItem[] = [
        generateMockSession(new Date(), 0, threeWines),
        generateMockSession(new Date(), 0, twoBeers),
        generateMockSession(new Date(), 0, fourOther),
      ];
      
      const result = calculateThisMonthUnits(mockDateObject, testSessions);
      expect(result).toBe(9);  // 4 + 3 + 2
    });
    
  });


describe('getZeroUnitsObject', () => {
    // it('should return an object with all unit types set to 0', () => {
    //   const zeroUnits = getZeroUnitsObject();
    //   const zeroUnitsValues = Object.values(zeroUnits)
  
    //   for (let unit in zeroUnitsValues) {
    //     expect(zeroUnits[unit as keyof UnitTypesProps]).toBe(0);
    //   };
    // });
  
    // it('should return a new object on each call', () => {
    //   const firstCall = getZeroUnitsObject();
    //   const secondCall = getZeroUnitsObject();
  
    //   firstCall.beer = 5;  // Modify one of the properties of the first object
  
    //   expect(firstCall.beer).toBe(5);
    //   expect(secondCall.beer).toBe(0);  // The second object should remain unchanged
    // });

    it('should have all the expected keys based on UnitTypesProps type', () => {
        const zeroUnits = getZeroUnitsObject();
        const expectedKeys = UnitTypesKeys;
    
        expect(Object.keys(zeroUnits)).toEqual(expectedKeys);
    });
});



describe('getRandomUnitsObject', () => {

    // it('should return an object with all values between 0 and maxUnitValue (exclusive)', () => {
    //   const randomUnits = getRandomUnitsObject(30);
  
    //   for (let unit in randomUnits) {
    //       expect(randomUnits[unit as keyof UnitTypesProps]).toBeGreaterThanOrEqual(0);
    //       expect(randomUnits[unit as keyof UnitTypesProps]).toBeLessThanOrEqual(30);
    //   };
    // });
  
    it('should return different values on subsequent calls (most likely)', () => {
      const firstCall = getRandomUnitsObject(30);
      const secondCall = getRandomUnitsObject(30);
  
      // Given the nature of randomness, this test might occasionally fail.
      // However, the likelihood of two random objects being exactly the same is extremely low.
      expect(firstCall).not.toEqual(secondCall);
    });

    it('should have all the expected keys based on UnitTypesProps type', () => {
        const randomUnits = getZeroUnitsObject();
        const expectedKeys = UnitTypesKeys;
    
        expect(Object.keys(randomUnits)).toEqual(expectedKeys);
    });
  
  });


  describe('unitsToColors', () => {

    // Create a mock for UnitsToColorsData for consistent testing
    const mockUnitsToColorsData: UnitsToColorsData = {
        yellow: 2,
        orange: 4
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

