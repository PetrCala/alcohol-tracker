// Expansive upon each swipe, stale data
// const getMarkedDates = (date: Date, drinkingSessionData: DrinkingSessionData[]): SessionsCalendarMarkedDates => {
//     if (!drinkingSessionData) return {};
//     // Check whether the current month is already marked
//     var currentMonthString = `-${String(date.getMonth() + 1).padStart(2, '0')}-`
//     var monthAlreadyIncluded = Object.keys(markedDates).some(key => key.includes(currentMonthString));
//     if (monthAlreadyIncluded){
//         return markedDates; // Assume these contain all current month's marks
//     };
//     // Month not marked yet - generate new marks
//     var sessions = getSingleMonthDrinkingSessions(date, drinkingSessionData, true);
//     var aggergatedSessions = aggregateSessionsByDays(sessions);
//     var monthTotalSessions = fillInRestOfMonth(date, aggergatedSessions, true);
//     var newMarkedDates = monthEntriesToColors(monthTotalSessions);
//     return newMarkedDates;

//     return { ...markedDates, ...newMarkedDates } // Expand the state
// };