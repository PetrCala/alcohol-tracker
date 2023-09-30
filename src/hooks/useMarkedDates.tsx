// hooks/useMarkedDates.tsx
import { useState, useEffect } from 'react';
import { DateObject, SessionsCalendarMarkedDates } from '../types/components';
import { DrinkingSessionArrayItem, PreferencesData } from '../types/database';
import { formatDate, getSingleMonthDrinkingSessions, getYearMonth, sumAllPoints, sumAllUnits, unitsToColors } from '../utils/dataHandling';

type DatesType = {
    [key: string]: {
        units: number;
        blackout: boolean;
    }
};

const useMarkedDates = (
    visibleDateObject: DateObject, 
    calendarData: DrinkingSessionArrayItem[], 
    preferences: PreferencesData
):SessionsCalendarMarkedDates => {
    const [markedDates, setMarkedDates] = useState<SessionsCalendarMarkedDates>({});
    const [monthsChecked, setMonthsChecked] = useState<string[]>([]);
    // const [loadingMarkedDates, setLoadingMarkedDates] = useState<boolean>(true);
    
    const monthAlreadyChecked = (dateObject: DateObject):boolean => {
        var yearMonth = getYearMonth(dateObject);
        if (monthsChecked.includes(yearMonth)) {
            return true;
        };
        return false;
    };

    const markCurrentMonthAsChecked = (dateObject: DateObject):void => {
        var yearMonth = getYearMonth(dateObject);
        if (!monthsChecked.includes(yearMonth)) {
            setMonthsChecked(prev => [...prev, yearMonth]);
        };
    };

    const aggregateSessionsByDays = (sessions: DrinkingSessionArrayItem[]): DatesType => {
        return sessions.reduce((
            acc: DatesType,
            item: DrinkingSessionArrayItem
        ) => {
            let dateString = formatDate(new Date(item.start_time)); // MM-DD-YYYY
            let newUnits:number = sumAllUnits(item.units);

            acc[dateString] = acc[dateString] ? { 
                // Already an entry exists
                units: acc[dateString].units + newUnits,  
                blackout: acc[dateString].blackout === false ? item.blackout : true
            } : { 
                // First entry
                units: newUnits, 
                blackout: item.blackout
            };

            return acc;
        }, {});
    };

    const monthEntriesToColors = (sessions: DatesType, preferences: PreferencesData) => {
        // MarkedDates object, see official react-native-calendars docs
        let markedDates: SessionsCalendarMarkedDates = Object.entries(sessions).reduce((
            acc: SessionsCalendarMarkedDates,
            [key, {
                 units: value,
                 blackout: blackoutInfo
            }]
        ) => {
            let unitsToColorsInfo = preferences.units_to_colors;
            let color:string = unitsToColors(value, unitsToColorsInfo);
            if (blackoutInfo === true){
                color = 'black'
            };
            let textColor:string = 'black';
            if (color == 'red' || color == 'green' || color == 'black'){
                textColor = 'white';
            }
            acc[key] = { 
                units: value, // number of units
                color: color,
                textColor: textColor
            }
            return acc;
        }, {});
        return markedDates;
    };

    /** Input a date and the drinking session data and compute day marks
     * for days of the month around the specified date. 
     * 
     * @note Is meant to be ran numerous times, and could be modified into
     * an expansive nature (see utils/backup.tsx).
     * 
     * @param dateObject DateObject including the month to compute the dates for
     * @param drinkingSessionData All drinking session data
     * @param preferences User preferences data
     * @returns Marked dates as a JSON type object
     */
    const getMarkedDates = (dateObject: DateObject, drinkingSessionData: DrinkingSessionArrayItem[], preferences: PreferencesData): SessionsCalendarMarkedDates => {
        // Month not marked yet - generate new marks
        var date = new Date(dateObject.timestamp);
        var sessions = getSingleMonthDrinkingSessions(date, drinkingSessionData, true);
        var aggergatedSessions = aggregateSessionsByDays(sessions);
        var newMarkedDates = monthEntriesToColors(aggergatedSessions, preferences);
        markCurrentMonthAsChecked(dateObject);

        return { ...markedDates, ...newMarkedDates } // Expand the state
    };

    const updateMarkedDates = (reset:boolean = false) => {
        let newMarkedDates = getMarkedDates(visibleDateObject, calendarData, preferences); // Fetch marked dates for current month
        let updatedMarkedDates = reset ? newMarkedDates : { ...markedDates, ...newMarkedDates}
        setMarkedDates(updatedMarkedDates);
    };

    // Always update marked dates on source data change
    useEffect(() => {
        updateMarkedDates(true);
        markCurrentMonthAsChecked(visibleDateObject);
    }, [calendarData, preferences]);

    // Update marked dates conditionally on visible month change
    useEffect(() => {
        if (!monthAlreadyChecked(visibleDateObject)) {
            updateMarkedDates(false);
            markCurrentMonthAsChecked(visibleDateObject);
        }
    }, [visibleDateObject]);

    return markedDates;
};

export default useMarkedDates;