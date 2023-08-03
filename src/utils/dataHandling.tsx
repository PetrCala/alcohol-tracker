import { DrinkingSessionData } from "./types";
import { ref, get } from "firebase/database";



export function timestampToDate( timestamp: number) {
    return new Date(timestamp);
};

export function formatDateToDay(inputDate: Date, addYear: boolean = true): string {
    // Extract the date, month, and year, and format them as MM-DD-YYYY
    var date = ('0' + (inputDate.getMonth() + 1)).slice(-2) + '-' + 
                ('0' + inputDate.getDate()).slice(-2)
    // Extract year
    if (addYear) {
        date = date + '-' + inputDate.getFullYear();
    }
    return date
}

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

/** Input an array of drinking sessions and return only those 
 * on a given day
 * 
 * @param day A Date type object representing a day for which
 * the sessions should be loaded
 * @param sessions An array of drinking sessions.
 */
export function getSingleDayDrinkingSessions(day: Date, sessions: DrinkingSessionData[]) {
    // Define the time boundaries
    day.setHours(0, 0, 0, 0); // set to start of day
    
    const tomorrow = new Date(day);
    tomorrow.setDate(day.getDate() + 1); // set to start of next day
    
    // convert to UNIX timestamp
    const todayUnix = Math.floor(day.getTime());
    const tomorrowUnix = Math.floor(tomorrow.getTime());
    
    let result: DrinkingSessionData[] = [];
    for (let i in sessions) { // i is a numeric index from 0
        const session = sessions[i];
        if (session.timestamp >= todayUnix && session.timestamp < tomorrowUnix) {
            result[i] = session;
        }
    }

    return result;
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