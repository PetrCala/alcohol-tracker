import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
    sumAllUnits,
    getYearMonth
} from '../utils/dataHandling';
import { 
    SessionsCalendarProps,
    SessionsCalendarMarkedDates
} from '../types/components';
import { DrinkingSessionArrayItem, DrinkingSessionData, PreferencesData } from '../types/database';
import { DateObject, DayState } from '../types/components';
import LoadingData from './LoadingData';
import useMarkedDates from '../hooks/useMarkedDates';

type CalendarColors = 'yellow' | 'red' | 'orange' | 'black';

type DayMarking = {
    color?: CalendarColors;
    textColor?: string;
    units?: number;
}

// Custom Day Component
const DayComponent: React.FC<{
    date:DateObject, 
    state:DayState, 
    marking:DayMarking, 
    theme:any, 
    onPress: (day: DateObject) => void 
}> = ({ date, state, marking, theme, onPress }) => {
    // Calculate the date information with memos to avoid recalculation
    const today = useMemo(() => new Date(), []);
    const tomorrow = useMemo(() => changeDateBySomeDays(today, 1), [today]);
    const tomorrowMidnight = useMemo(() => getTimestampAtMidnight(tomorrow), [tomorrow]);

    const dateNoLaterThanToday = useCallback((date: DateObject): boolean => {
        return date.timestamp < tomorrowMidnight;
    }, [tomorrowMidnight]);

    const getTextStyle = (state: DayState) => {
        let textStyle = styles.dayText;
        if (state === 'disabled') {
            textStyle = {...textStyle, ...styles.dayTextDisabled};
        } else if (state === 'today') {
            textStyle = {...textStyle, ...styles.dayTextToday};
        }
        return textStyle;
    };
    
    const getMarkingContainerStyle = (date: DateObject, marking: DayMarking) => {
        let baseStyle = styles.daySessionsMarkingContainer;
    
        if (state === 'disabled') {
            return { ...baseStyle, borderWidth: 0 };
        }
        
        const colors = ['black', 'yellow', 'red', 'orange'];
        if (!dateNoLaterThanToday(date)){
            return { ...baseStyle, borderWidth: 0 };
        } else if (!marking?.color){
            return { ...baseStyle, backgroundColor: 'green' };
        } else if (colors.includes(marking?.color)) {
            return { ...baseStyle, backgroundColor: marking?.color };
        } else {
            return { ...baseStyle, backgroundColor: 'green' };
            throw new Error("Unspecied color in the calendar")
        };
    };
    
    const getMarkingTextStyle = (marking: DayMarking) => {
        let baseStyle = styles.daySessionMarkingText;
    
        const colorToTextColorMap: Record<CalendarColors, string> = {
            'yellow': 'black',
            'red': 'white',
            'orange': 'black',
            'black': 'white',
        };

        if (!marking?.color) {
            return { ...baseStyle, fontSize: 0 };
        } else if (colorToTextColorMap[marking?.color]) {
            return { ...baseStyle, color: colorToTextColorMap[marking?.color] };
        };
        return { ...baseStyle, fontSize: 0 };
        throw new Error("Unspecied color in the calendar")
    };

    return (
        <TouchableOpacity
            style={styles.dayContainer}
            onPress={() => onPress(date)}
        >
            <Text style={getTextStyle(state)}>
                {date.day}
            </Text>
            <View style={getMarkingContainerStyle(date, marking)}>
                <Text style={getMarkingTextStyle(marking)}>
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
    const [calendarData, setCalendarData ] = useState<DrinkingSessionArrayItem[]>(drinkingSessionData);
    const markedDates = useMarkedDates(visibleDateObject, calendarData, preferences);

    /** Handler for the left arrow calendar press. Uses a callback to
     * move to the previous month
     * 
     * @param subtractMonth A callback to move the months
     */
    const handleLeftArrowPress = (subtractMonth: () => void) => {
        const previousMonth = getPreviousMonth(visibleDateObject);
        setVisibleDateObject(previousMonth);
        subtractMonth(); // Use the callback to move to the previous month
    };
    
    /** Handler for the left arrow calendar press. Uses a callback to
     * move to the following month
     * 
     * @param addMonth A callback to move the months
    */
   const handleRightArrowPress = (addMonth: () => void) => {
        const nextMonth = getNextMonth(visibleDateObject);
        setVisibleDateObject(nextMonth);
        addMonth(); // Use the callback to move to the next month
    };
     
    // Monitor the local calendarData hook that depends on the drinking session data
    useEffect(() => {
        setCalendarData(drinkingSessionData);
    }, [drinkingSessionData]);

    // if (loadingMarkedDates) return <LoadingData loadingText={""}/>;

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