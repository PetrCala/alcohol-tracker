import { DrinkingSessionData, UnitTypesProps } from "../types/database";
import { DateObject } from "../types/various";

export function formatDate (date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatDateToDay(date: Date): string {
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export function formatDateToTime(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

/** Convert a timestamp to a Date object */
export function timestampToDate( timestamp: number): Date {
    return new Date(timestamp);
};

/** Convert a Date type object to a JSON-type DateObject.
 * Month is indexed from 1 in this object
 * 
 * @param date Date type object
 * @returns A DateObject
 */
export function dateToDateObject( date:Date ): DateObject {
    const dateObject = {
        dateString: formatDate(date),
        day: date.getDate(),
        month: date.getMonth() + 1,
        timestamp: date.getTime(),
        year: date.getFullYear()
    };
    return dateObject;
};

/** Inverse of timestampToDate, sets time to midnight
 */
export function getTimestampAtMidnight(date: Date): number {
    const dateAtMidnight = new Date(date);
    dateAtMidnight.setHours(0, 0, 0, 0);
    return dateAtMidnight.getTime();
};

export function getTimestampAtNoon(date: Date): number {
    const dateAtMidnight = new Date(date);
    dateAtMidnight.setHours(12, 0, 0, 0);
    return dateAtMidnight.getTime();
};

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
    let newDate = new Date(currentDate.year, currentDate.month - 1, currentDate.day);
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
    let newDate = new Date(currentDate.year, currentDate.month - 1, currentDate.day);
    let originalMonth = newDate.getMonth();
    
    newDate.setMonth(originalMonth - 1);
    
    // If the day got changed because the previous month doesn't have that day (e.g., 31st March to something not 31st February)
    if ((newDate.getMonth() - originalMonth + 12) % 12 !== 11) {
        newDate.setDate(0); // Setting the date to the last day of the previous month
    }

    return dateToDateObject(newDate);
};

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
};

/** Subset an array of drinking sessions to a single day.
 * 
 * @param dateObject Date type object for whose day to subset the sessions to
 * @param sessions An array of sessions to subset
 * @returns The subsetted array of sessions
 */
export function getSingleDayDrinkingSessions(date: Date, sessions: DrinkingSessionData[]) {
    // Define the time boundaries
    date.setHours(0, 0, 0, 0); // set to start of day
    
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1); // set to start of next day
  
    // Convert to UNIX timestamp
    const todayUnix = Math.floor(date.getTime());
    const tomorrowUnix = Math.floor(tomorrow.getTime());
  
    const filteredSessions = sessions.filter(session => session.start_time >= todayUnix && session.start_time < tomorrowUnix);

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
export function getSingleMonthDrinkingSessions(date: Date, sessions: DrinkingSessionData[], untilToday: boolean = false){
    date.setHours(0, 0, 0, 0); // To midnight
    // Find the beginning date
    let firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    let beginningDate = firstDayOfMonth;
    // Find the end date
    const firstDayOfNextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    let endDate = firstDayOfNextMonth;
    if (untilToday){
        let today = new Date(); // automatically set to midnight
        let tomorrowMidnight = changeDateBySomeDays(today, 1);
        if (endDate >= tomorrowMidnight){
            endDate = tomorrowMidnight; // Filter until today only
        };
    };
    // Find the timestamps
    const beginningUnix = Math.floor(beginningDate.getTime());
    const endUnix = Math.floor(endDate.getTime());
    // Filter to current month only
    const monthDrinkingSessions = sessions.filter(session =>
        session.start_time >= beginningUnix && session.start_time < endUnix);
    return monthDrinkingSessions;
};

/** Sum up all units of alcohol regardless of category
 * 
 * @param all_units Units to sum up.
 */
export function sumAllUnits(all_units: UnitTypesProps){
    return Object.values(all_units).reduce((acc, curr) => acc + curr, 0);
};

/** Generate an object with all available units where 
 * each unit's value is set to 0.
 */
export const getZeroUnitsObject = ():UnitTypesProps => {
    // Create an object with all keys set to 0
    let unitTypes = {} as UnitTypesProps;

    // Create an array of all keys in UnitTypesProps type
    const keys = Object.keys(unitTypes) as (keyof UnitTypesProps)[];

    keys.forEach(key => {
        unitTypes[key] = 0;
    });

    return unitTypes;
};

/** Generate an object with all available units where 
 * each unit's value is set to a random integer.
 */
export const getRandomUnitsObject = (maxUnitValue:number = 30):UnitTypesProps => {

    // Create an object with all keys set to 0
    let unitTypes = {} as UnitTypesProps;

    // Create an array of all keys in UnitTypesProps type
    const keys = Object.keys(unitTypes) as (keyof UnitTypesProps)[];

    keys.forEach(key => {
        unitTypes[key] = Math.floor(Math.random() * maxUnitValue);
    });

    return unitTypes;
};


/** Convert the units consumed to colors.
 * 
 * @param units Number of units consumed
 * @returns String
 */
export function unitsToColors(units: number){
    let sessionColor: any;
    if (units > 10) {
        sessionColor = 'red';
    } else if (units > 5) {
        sessionColor = 'orange';
    } else if (units > 0) {
        sessionColor = 'yellow';
    } else {
        sessionColor = 'green';
    };
    return sessionColor;
};
