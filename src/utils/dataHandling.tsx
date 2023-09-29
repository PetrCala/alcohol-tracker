import { 
    DrinkingSessionArrayItem, 
    UnitTypesKeys, 
    UnitTypesNames, 
    UnitTypesProps, 
    UnitsObject, 
    UnitsToColorsData 
} from "../types/database";
import { DateObject } from "../types/components";
import { getRandomInt } from "./choice";

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
export function getSingleDayDrinkingSessions(date: Date, sessions: DrinkingSessionArrayItem[]) {
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
export function getSingleMonthDrinkingSessions(date: Date, sessions: DrinkingSessionArrayItem[], untilToday: boolean = false){
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
export function sumAllUnits(units: UnitsObject): number{
    return Object.values(units).reduce((total, unitTypes) => {
        return total + Object.values(unitTypes).reduce((subTotal, unitCount) => subTotal + (unitCount || 0), 0);
    }, 0);
};

/** Sum up units of a specific type of alcohol across multiple sessions
 * 
 * @param unitsObject UnitsObject to sum up.
 * @param unitType The type of unit to sum.
 */
export function sumUnitsOfSingleType(unitsObject: UnitsObject, unitType: typeof UnitTypesKeys[number]): number {
    return Object.values(unitsObject).reduce((total, session) => {
        return total + (session[unitType] || 0);
    }, 0);
};

/** Sum up units of a single Unit type object.
 * 
 * @param unitTypes A UnitTypesProps kind of object
 * @returns The sum
 */
export function sumUnitTypes(unitTypes: UnitTypesProps): number {
    return Object.values(unitTypes).reduce((subTotal, unitCount) => subTotal + (unitCount || 0), 0);
};

/** Using an object of units, calculate how many points this object amounts to.
 * 
 * @param units UnitsObject type
 * @returns Number of points
 * 
 * @example let points = sumAllPoints({
 * [1694819284]: {'beer': 5},
 * [1694819286]: {'wine': 2, 'cocktail': 1},
 * })
 */
export function sumAllPoints(units:UnitsObject):number {
    // sum all points functionality here
    return 1
};

/** Input a session item and return the timestamp of the last unit
 * consumed in that session.
 * 
 * @param session Drinking session array item
 * @return Timestamp of the last unit consumed
 */
export function getLastUnitAddedTime(session: DrinkingSessionArrayItem):number | null{
    const timestamps = Object.keys(session.units).map(Number); // All timestamps
    // Return the maximum timestamp or null if there aren't any
    return timestamps.length ? Math.max(...timestamps) : null;
};

/** Out of an array of session items, return an a session that is ongoing. If there is no such session, return null
 */
export function findOngoingSession(sessions: DrinkingSessionArrayItem[]): DrinkingSessionArrayItem | null {
    const ongoingSession = sessions.find(session => session.ongoing === true);
    return ongoingSession ? ongoingSession : null;
};

/** Enter a dateObject and an array of drinking sessions and calculate 
 * units consumed in the current month.
 * 
 * @param dateObject DateObject
 * @param sessions Array of drinking sessions
 * @returns Number of units consumed during the current month
 */
export const calculateThisMonthUnits = (dateObject: DateObject, sessions: DrinkingSessionArrayItem[]): number => {
    // Subset to this month's sessions only
    const currentDate = timestampToDate(dateObject.timestamp);
    const sessionsThisMonth = getSingleMonthDrinkingSessions(
        currentDate, sessions, false
    );
    // Sum up the units
    return sessionsThisMonth.reduce((sum, session) => sum + sumAllUnits(session.units), 0);
};

/** List all units to add and their amounts and add this to the current units hook
* 
* @param units UnitTypesProps kind of object listing each unit to add and its amount
*/
export const addUnits = (existingUnits: UnitsObject, units: UnitTypesProps): UnitsObject => {
 let newUnits: UnitsObject = {
   ...existingUnits,
   [Date.now()]: units
 };
 return newUnits;
};

/** Specify the kind of unit to remove units from and the number of units to remove.
* Remove this many units from that kind of unit
* 
* @param unitType Kind of unit to remove the units from
* @param number Number of units to remove
*/
export const removeUnits = (existingUnits: UnitsObject, unitType: typeof UnitTypesKeys[number], count: number):UnitsObject => {
 let unitsToRemove = count;
 const updatedUnits: UnitsObject = JSON.parse(JSON.stringify(existingUnits)); // Deep copy
 for (const timestamp of Object.keys(updatedUnits).sort((a, b) => +b - +a)) { // sort in descending order
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
   };

   if (unitsToRemove <= 0) {
     break;
   };
 }
 return updatedUnits;
};

/** Input an array of drinkng sessions and remove all unit records
 * where all units of a given timestamp are set to 0. Return the 
 * updated array.
 * 
 * @param session Array of drinking sessions
 * @returns The updated array
 */
export const removeZeroObjectsFromSession = (session:DrinkingSessionArrayItem):DrinkingSessionArrayItem => {
  // Clone the session object to avoid mutating the original object
  const updatedSession = { ...session };

  // Go through each timestamp in the session's units object
  for (const timestamp in updatedSession.units) {
    // Check if all the unit values are set to 0
    const allZero = UnitTypesKeys.every(
      key => updatedSession.units[timestamp][key] === 0 || updatedSession.units[timestamp][key] === undefined
    );

    // If all unit values are 0, delete the timestamp from the units object
    if (allZero) {
      delete updatedSession.units[+timestamp];
    }
  }

  return updatedSession;
};


/** Generate an object with all available units where 
 * each unit's value is set to a random integer.
 */

export const getRandomUnitsObject = (maxUnitValue: number = 30): UnitsObject => {
    const unitWithRandomValues: UnitTypesProps = {};

    // Loop over each item in UnitTypesKeys and set its value to a random number between 0 and maxUnitValue
    for (const key of UnitTypesKeys) {
        unitWithRandomValues[key] = getRandomInt(0, maxUnitValue);
    }

    // Create a new object with a current timestamp
    const timestamp = Date.now();
    const result: UnitsObject = {
        [timestamp]: unitWithRandomValues
    };

    return result;
};

/** Generate an object with all available units where each unit's value is set to 0.
 */
export function getZeroUnitsObject(): UnitsObject {
    return getRandomUnitsObject(0);
};

/** Convert the units consumed to colors.
 * 
 * @param units Number of units consumed
 * @param unitsToColorsInfo Information about limits for different colors
 * @returns String
 */
export function unitsToColors(units: number, unitsToColorsInfo:UnitsToColorsData): string{
    let sessionColor: string;
    if (units === 0) {
        sessionColor = 'green';
    } else if (units <= unitsToColorsInfo.yellow) {
        sessionColor = 'yellow';
    } else if (units <= unitsToColorsInfo.orange) {
        sessionColor = 'orange';
    } else {
        sessionColor = 'red';
    };
    return sessionColor;
};

/** Insert the key of a unit and find its matching verbose name.
 * 
 * @returns The verbose name of that unit.
 */
export const findUnitName = (unitKey: typeof UnitTypesKeys[number]) => {
    let unitIdx = UnitTypesKeys.findIndex((type) => type === unitKey);
    let unitName = UnitTypesNames[unitIdx];
    return unitName;
};
