import { DrinkingSessionData } from "./types";

/** Convert a timestamp to a Date object */
export function timestampToDate( timestamp: number): Date {
    return new Date(timestamp);
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


/** A binary search to help identify the indexes of items that fall above
 * or below a target timestamp. Used to subset drinking sessions into a
 * certain timeframe.
 * 
 * @param sessions The array of drinking sessions to query
 * @param target Timestamp above/below which the sessions should appear
 * @param start If true, treat this timestamp as a start point. If false, as an
 * end point.
 * @returns An index representing where in the array the start/end point is located.
 */
function sessionsBinarySearch(sessions: DrinkingSessionData[], target: number, start: boolean): number {
    let left = 0;
    let right = sessions.length - 1;
  
    while (left <= right) {
      let mid = Math.floor((left + right) / 2);
  
      if (sessions[mid].timestamp === target) {
        return start ? mid : mid + 1;
      } else if (sessions[mid].timestamp < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  
    return start ? left : right;
  }


  /** Subset an array of drinking sessions to a single day.
   * 
   * @param day Day to subset the sessions for
   * @param sessions An array of sessions to subset
   * @returns The subsetted array of sessions
   */
export function getSingleDayDrinkingSessions(day: Date, sessions: DrinkingSessionData[]) {
    // Define the time boundaries
    day.setHours(0, 0, 0, 0); // set to start of day
    
    const tomorrow = new Date(day);
    tomorrow.setDate(day.getDate() + 1); // set to start of next day
    tomorrow.setMilliseconds(tomorrow.getMilliseconds() - 1); // 23:59:59 to not include midnight endtries
  
    // Convert to UNIX timestamp
    const todayUnix = Math.floor(day.getTime());
    const tomorrowUnix = Math.floor(tomorrow.getTime());
  
    // Find the start and end indices for the day's timeframe
    const startIndex = sessionsBinarySearch(sessions, todayUnix, true);
    const endIndex = sessionsBinarySearch(sessions, tomorrowUnix, false);
    
    // If all timestamps are below the start Unix, return an empty array
    if (startIndex > endIndex) {
      return [];
    }
  
    // Return the sessions between those indices
    const daySessions = sessions.slice(startIndex, endIndex);
    console.log(sessions);
    console.log(startIndex, endIndex);
    return daySessions;
}



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