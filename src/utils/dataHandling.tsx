import { DrinkingSessionData } from "../types/database";
import { DateObject } from "../types/various";

export function formatDate (date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Convert a timestamp to a Date object */
export function timestampToDate( timestamp: number): Date {
    return new Date(timestamp);
};

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

/** Input a timestamp and return the corresponding Date object
 * with time set to midnight
 */
export function getDateAtMidnightFromTimestamp(timestamp: number): Date {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0); // Set the time to midnight
    return date;
  }

export function formatDateToDay(inputDate: Date, addYear: boolean = true): string {
    // Extract the date, month, and year, and format them as MM-DD-YYYY
    var date = ('0' + (inputDate.getMonth() + 1)).slice(-2) + '-' + 
                ('0' + inputDate.getDate()).slice(-2)
    // Extract year
    if (addYear) {
        date = date + '-' + inputDate.getFullYear();
    }
    return date
};

export function formatDateToTime(inputDate: Date): string {
    // Extract the hours and minutes, and format them as HH:MM
    var time = ('0' + inputDate.getHours()).slice(-2) + ':' + 
                ('0' + inputDate.getMinutes()).slice(-2);
    return time;
}

export function changeDateBySomeDays(inputDate: Date, days: number): Date {
    let newDate = new Date(inputDate); // to avoid mutating original date
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

/** Input a DateObject and change it to the following month.
 * 
 * @param currentDate Current date as a DateObject
 * @returns Next month's date as a DateObject
 */
export const getNextMonth = (currentDate: DateObject): DateObject => {
    let newDate = new Date(currentDate.year, currentDate.month - 1, currentDate.day);
    newDate.setMonth(newDate.getMonth() + 1); // Add one month
    return dateToDateObject(newDate);
};
    

/** Input a DateObject and change it to the previous month.
 * 
 * @param currentDate Current date as a DateObject
 * @returns Previous month's date as a DateObject
 */
export const getPreviousMonth = (currentDate: DateObject): DateObject => {
    let newDate = new Date(currentDate.year, currentDate.month - 2, currentDate.day); // Subtracting 2 since JS month is 0-indexed
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
  }

export function createDateObject(date: Date): DateObject {
    return {
      dateString: date.toISOString().split('T')[0],
      day: date.getDate(),
      month: date.getMonth() + 1, // JavaScript months are 0-indexed, so add 1
      timestamp: date.getTime(),
      year: date.getFullYear(),
    };
  }

/** Subset an array of drinking sessions to a single day.
 * 
 * @param dateObject Date type object for whose day to subset the sessions to
 * @param sessions An array of sessions to subset
 * @returns The subsetted array of sessions
 */
export function getSingleDayDrinkingSessions(dateObject: Date, sessions: DrinkingSessionData[]) {
    // Define the time boundaries
    dateObject.setHours(0, 0, 0, 0); // set to start of day
    
    const tomorrow = new Date(dateObject);
    tomorrow.setDate(dateObject.getDate() + 1); // set to start of next day
  
    // Convert to UNIX timestamp
    const todayUnix = Math.floor(dateObject.getTime());
    const tomorrowUnix = Math.floor(tomorrow.getTime());
  
    const filteredSessions = sessions.filter(session => session.timestamp >= todayUnix && session.timestamp < tomorrowUnix);

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
export function getSingleMonthDrinkingSessions(dateObject: Date, sessions: DrinkingSessionData[], untilToday: boolean = false){
    dateObject.setHours(0, 0, 0, 0); // To midnight
    // Find the beginning date
    let firstDayOfMonth = new Date(dateObject.getFullYear(), dateObject.getMonth(), 1);
    let beginningDate = firstDayOfMonth;
    // Find the end date
    const firstDayOfNextMonth = new Date(dateObject.getFullYear(), dateObject.getMonth() + 1, 1);
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
        session.timestamp >= beginningUnix && session.timestamp < endUnix);
    return monthDrinkingSessions;
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
