import { 
    changeDateBySomeDays,
    dateToDateObject, 
    formatDate,
    formatDateToDay,
    formatDateToTime,
    getNextMonth, 
    getPreviousMonth, 
    getTimestampAtMidnight, 
    getTimestampAtNoon, 
    timestampToDate 
} from "../../src/utils/dataHandling";
import { DateObject } from "../../src/types/various";


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
        const originalDateObj: DateObject = {
            dateString: "2023-08-15",
            day: 15,
            month: 8,
            timestamp: new Date(2023, 7, 15).getTime(),
            year: 2023
        };
        const newDateObj = getNextMonth(originalDateObj);
        checkIsDateAndHasExpectedValues(newDateObj, 15, 9);  // Expected: September 15
    });

    it('shifts an end-of-month date (with 31 days) to the last day of the next month (with 30 days)', () => {
        const originalDateObj = {
            dateString: "2023-07-31",
            year: 2023, 
            month: 7,  // July
            timestamp: new Date(2023, 6, 31).getTime(),
            day: 31
        };
        const newDate = getNextMonth(originalDateObj);
        checkIsDateAndHasExpectedValues(newDate, 31, 8); // Expected: August 31 (as August has 31 days)
    });

    it('shifts an end-of-month date (with 31 days) to the last day of the next month (with 28/29 days)', () => {
        const originalDateObj = {
            dateString: "2023-01-31",
            year: 2023,  // Non-leap year
            month: 1,  // January
            timestamp: new Date(2023, 0, 31).getTime(),
            day: 31
        };
        const newDate = getNextMonth(originalDateObj);
        checkIsDateAndHasExpectedValues(newDate, 28, 2); // Expected: February 28 (non-leap year)
    });

    it('shifts an end-of-month date (with 31 days) to the last day of the next month (in a leap year)', () => {
        const originalDateObj = {
            dateString: "2024-01-31",
            year: 2024,  // Leap year
            month: 1,  // January
            timestamp: new Date(2024, 0, 31).getTime(),
            day: 31
        };
        const newDate = getNextMonth(originalDateObj);
        checkIsDateAndHasExpectedValues(newDate, 29, 2); // Expected: February 29 (leap year)
    });

    it('shifts an end-of-month date (with 30 days) to the same day of the next month (with 31 days)', () => {
        const originalDateObj = {
            dateString: "2023-04-32",
            year: 2023, 
            month: 4,  // April
            timestamp: new Date(2023, 3, 30).getTime(),
            day: 30
        };
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
        const originalDateObj: DateObject = {
            dateString: "2023-08-15",
            day: 15,
            month: 8,
            timestamp: new Date(2023, 7, 15).getTime(),
            year: 2023
        };
        const newDate = getPreviousMonth(originalDateObj);
        checkDateValues(newDate, 2023, 7, 15); // Expected: 15th July 2023
    });

    it('handles end-of-month to month with fewer days (31 to 30)', () => {
        const originalDateObj: DateObject = {
            dateString: "2023-08-31",
            day: 31,
            month: 8,
            timestamp: new Date(2023, 7, 31).getTime(),
            year: 2023
        };
        const newDate = getPreviousMonth(originalDateObj);
        checkDateValues(newDate, 2023, 7, 31); // Expected: 31st July 2023
    });

    it('handles end-of-month to month with fewer days (31 to 28)', () => {
        const originalDateObj: DateObject = {
            dateString: "2023-03-31",
            day: 31,
            month: 3,
            timestamp: new Date(2023, 2, 31).getTime(),
            year: 2023
        };
        const newDate = getPreviousMonth(originalDateObj);
        checkDateValues(newDate, 2023, 2, 28); // Expected: 28th February 2023 (non-leap year)
    });

    it('handles end-of-month to month with fewer days (31 to 29 in leap year)', () => {
        const originalDateObj: DateObject = {
            dateString: "2024-03-31",
            day: 31,
            month: 3,
            timestamp: new Date(2024, 2, 31).getTime(),
            year: 2024
        };
        const newDate = getPreviousMonth(originalDateObj);
        checkDateValues(newDate, 2024, 2, 29); // Expected: 29th February 2024 (leap year)
    });

    it('handles year change', () => {
        const originalDateObj: DateObject = {
            dateString: "2024-01-01",
            day: 1,
            month: 1,
            timestamp: new Date(2024, 0, 1).getTime(),
            year: 2024
        };
        const newDate = getPreviousMonth(originalDateObj);
        checkDateValues(newDate, 2023, 12, 1); // Expected: 1st December 2023
    });

});