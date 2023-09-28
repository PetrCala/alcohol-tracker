import React, { useEffect, useState, useMemo } from 'react';
import { 
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { 
    formatDate,
    getPreviousMonth,
    getNextMonth,
    getSingleMonthDrinkingSessions, 
    timestampToDate, 
    unitsToColors, 
    changeDateBySomeDays,
    getTimestampAtMidnight,
    sumAllUnits
} from '../utils/dataHandling';
import { 
    SessionsCalendarProps,
    SessionsCalendarMarkedDates
} from '../types/components';
import { DrinkingSessionArrayItem, DrinkingSessionData } from '../types/database';
import { DateObject, DayState } from '../types/components';
import LoadingData from './LoadingData';


// Custom Day Component
const DayComponent: React.FC<{
    date:DateObject, 
    state:DayState, 
    marking:any, 
    theme:any, 
    onPress: (day: DateObject) => void 
}> = ({ date, state, marking, theme, onPress }) => {
    var today = new Date();
    var tomorrow = changeDateBySomeDays(today, 1);
    var tomorrowMidnight = getTimestampAtMidnight(tomorrow);

    const dateNoLaterThanToday = (date:DateObject): boolean => {
        if (date.timestamp < tomorrowMidnight){
            return true;
        };
        return false;
    };

    return (
        <TouchableOpacity
            style={styles.dayContainer}
            onPress={() => onPress(date)}
        >
        <Text
        style={[styles.dayText,
            state === 'disabled' ?  styles.dayTextDisabled : 
            state === 'today' ?  styles.dayTextToday : {},
            ]}
        >
            {date.day}
        </Text>
        <View style={[
            styles.daySessionsMarkingContainer,
            state === 'disabled' ? {borderWidth: 0 } : // No color for disabled squares
            marking?.color == 'black' ? {backgroundColor: 'black'} :
            marking?.color == 'yellow' ? {backgroundColor: 'yellow'} :
            marking?.color == 'red' ? {backgroundColor: 'red'} :
            marking?.color == 'orange' ? {backgroundColor: 'orange'} :
            dateNoLaterThanToday(date) ? {backgroundColor: 'green'} :
            {borderWidth: 0}
        ]}>
            <Text style={[
                styles.daySessionMarkingText,
                marking?.color == 'green' ? {fontSize: 0} : // Invisible marking
                marking?.color == 'yellow' ? {color: 'black'} :
                marking?.color == 'red' ? {color: 'white'} :
                marking?.color == 'orange' ? {color: 'black'} :
                marking?.color == 'black' ? {color: 'white'} :
                {}
            ]}>
                {state === 'disabled' ? '' : marking?.units}
            </Text>
        </View>
        </TouchableOpacity>
    );
};


const SessionsCalendar = ({ 
    drinkingSessionData, 
    preferences,
    visibleDateObject, 
    setVisibleDateObject,
    onDayPress
}: SessionsCalendarProps) => {
    const [calendarData, setCalendarData ] = useState<DrinkingSessionArrayItem[] | null>(drinkingSessionData);
    const [markedDates, setMarkedDates] = useState<SessionsCalendarMarkedDates>({});
    
    type DatesType = {
        [key: string]: {
            units: number;
            blackout: boolean;
        }
    }

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


    const monthEntriesToColors = (sessions: DatesType) => {
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
     * @param date Date that includes the month to compute the marks for
     * @param drinkingSessionData All drinking session data
     * @returns Marked dates as a JSON type object
     */

    const getMarkedDates = (date: Date, drinkingSessionData: DrinkingSessionArrayItem[]): SessionsCalendarMarkedDates => {
        if (!drinkingSessionData) return {};

        // Check whether the current month is already marked
        var currentYearMonthString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-`
        var monthAlreadyIncluded = Object.keys(markedDates).some(key => key.includes(currentYearMonthString));
        if (monthAlreadyIncluded){
            return markedDates; // Assume these contain all current month's marks
        };
        // Month not marked yet - generate new marks
        var sessions = getSingleMonthDrinkingSessions(date, drinkingSessionData, true);
        var aggergatedSessions = aggregateSessionsByDays(sessions);
        // var monthTotalSessions = fillInRestOfMonth(date, aggergatedSessions, true);
        var newMarkedDates = monthEntriesToColors(aggergatedSessions);

        return { ...markedDates, ...newMarkedDates } // Expand the state
    };

    /** Handler for the left arrow calendar press. Uses a callback to
     * move to the previous month
     * 
     * @param subtractMonth A callback to move the months
     */
    const handleLeftArrowPress = (subtractMonth: () => void) => {
        const previousMonth = getPreviousMonth(visibleDateObject);
        setVisibleDateObject(previousMonth);
        updateMarkedDates(previousMonth);
        subtractMonth(); // Use the callback to move to the previous month
    };
    
    /** Handler for the left arrow calendar press. Uses a callback to
     * move to the following month
     * 
     * @param subtractMonth A callback to move the months
    */
   const handleRightArrowPress = (addMonth: () => void) => {
        const nextMonth = getNextMonth(visibleDateObject);
        setVisibleDateObject(nextMonth);
        updateMarkedDates(nextMonth);
        addMonth(); // Use the callback to move to the next month
    };
     
    const getInitialMarkedDates = () => {
        if (!calendarData) return {};
        
        const currentDate = timestampToDate(visibleDateObject.timestamp);
        return getMarkedDates(currentDate, calendarData);
    };
    
    const updateMarkedDates = (newDateObject:DateObject) => {
        if (calendarData != null){
            const newDate = timestampToDate(newDateObject.timestamp);
            const newMarkedDates = getMarkedDates(newDate, calendarData);
            setMarkedDates(newMarkedDates);
        } else {
            setMarkedDates({});
        };
    };
     
    // Keep the calendarData hook up to date
    useEffect(() => {
        setCalendarData(drinkingSessionData);
        setMarkedDates({}); // Reset marked dates when session data changes
    }, [drinkingSessionData]);
    

    // Set the marked dates to render on initial page load
    useEffect(() => {
        setMarkedDates(getInitialMarkedDates);
    }, [calendarData]);
     

    if (markedDates == null || drinkingSessionData == null) {
        return(
            <LoadingData
                loadingText=''
            />
        );
    }

    return (
        <Calendar
        current={visibleDateObject.dateString}
        dayComponent={({ date, state, marking, theme }) => 
            <DayComponent 
                date={date as DateObject} 
                state={state as DayState} 
                marking={marking as any}
                theme={theme as any}
                onPress={onDayPress}
            />
        }
        onPressArrowLeft={(subtractMonth) => handleLeftArrowPress(subtractMonth)}
        onPressArrowRight={(addMonth) => handleRightArrowPress(addMonth)}
        markedDates={markedDates}
        markingType={'period'}
        firstDay={preferences.first_day_of_week === 'Monday' ? 1 : 0}
        enableSwipeMonths={true}
        disableAllTouchEventsForDisabledDays={true}
        style={styles.mainScreenCalendarStyle}
        theme={{
            textDayHeaderFontWeight: 'bold',
        }}
        />
    );
    };
    
export default SessionsCalendar;


const styles = StyleSheet.create({
    // Day component styles
    dayContainer: {
        // flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // borderWidth: 1,
        // borderColor: '#E0E0E0',
        width: '100%',  // Give explicit width and height
        height: 50,
        // borderRadius: 4, // Rounded corners
    },
    dayText: {
        marginTop: 1,
        marginLeft: 2,
        fontSize: 10,
        color: 'black',
        alignSelf: 'flex-start',
    },
    dayTextDisabled: {
        color: '#D3D3D3',
    },
    dayTextToday: {
        color: 'blue', // Blue text for the current day
    },
    daySessionsMarkingContainer: {
        marginTop: 0,
        marginBottom: 5,
        height: 35,
        width: 35,
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 5,
        alignSelf: 'center',
        justifyContent: 'center',
    },
    daySessionMarkingText: {
        fontSize: 18,
        alignSelf: 'center',
    },
    // Calendar styles
    mainScreenCalendarStyle: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#000',
        flexGrow: 1,
        flexShrink: 1
    },
})