import React, { useEffect, useState, useMemo } from 'react';
import { 
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getSingleMonthDrinkingSessions, timestampToDate, unitsToColors } from '../utils/dataHandling';
import { 
    SessionsCalendarProps,
    SessionsCalendarMarkedDates
} from '../types/various';
import { DrinkingSessionData } from '../types/database';
import { DateObject, DayState } from '../types/various';
import LoadingData from './LoadingData';


// Custom Day Component
const DayComponent: React.FC<{
    date:DateObject, 
    state:DayState, 
    marking:any, 
    theme:any, 
    onPress: (day: DateObject) => void 
}> = ({ date, state, marking, theme, onPress }) => {
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
    //   onPress={() => console.log('hello')}
        // style={styles.dayText}
      >
        {date.day}
      </Text>
      { marking ?
        <View style={[
            styles.daySessionsMarkingContainer,
            marking?.color == 'green' ? {backgroundColor: 'green'} :
            marking?.color == 'yellow' ? {backgroundColor: 'yellow'} :
            marking?.color == 'red' ? {backgroundColor: 'red'} :
            marking?.color == 'orange' ? {backgroundColor: 'orange'} :
            {}
        ]}>
            <Text style={[
                styles.daySessionMarkingText,
                marking?.color == 'green' ? {color: 'green'} : // Invisible marking
                marking?.color == 'yellow' ? {color: 'black'} :
                marking?.color == 'red' ? {color: 'white'} :
                marking?.color == 'orange' ? {color: 'black'} :
                {}
            ]}>
                {marking.units}
            </Text>
        </View> :
        <View style={[
            styles.daySessionsMarkingContainer,
            {borderWidth: 0}
        ]}
        />
      }
    </TouchableOpacity>
  );
};


const SessionsCalendar = ({ drinkingSessionData, onDayPress} :SessionsCalendarProps) => {
    const [calendarData, setCalendarData ] = useState<DrinkingSessionData[] | null>(drinkingSessionData);
    const [markedDates, setMarkedDates] = useState<SessionsCalendarMarkedDates>({});
    
    type DatesType = {
        [key: string]: {
            units: number;
        }
    }

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    const aggregateSessionsByDays = (sessions: DrinkingSessionData[]): DatesType => {
        return sessions.reduce((
            acc: DatesType,
            item: DrinkingSessionData
        ) => {
            let dateString = formatDate(new Date(item.timestamp)); // MM-DD-YYYY

            acc[dateString] = acc[dateString] ? { 
                units: acc[dateString].units + item.units  // Already an entry exists
            } : { 
                units: item.units // First entry
            };
            return acc;
        }, {});
    };


    const fillInRestOfMonth = (dateObject:Date, inputData: DatesType, untilToday: boolean): DatesType => {
        const objectYear = dateObject.getFullYear();
        const objectMonth = dateObject.getMonth();
          // Get the number of days in the current month
        const daysInMonth = new Date(objectYear, objectMonth + 1, 0).getDate();
        let daysToFill: number = daysInMonth; 
        if (untilToday){
            const today = new Date();
            const todayMonth = today.getMonth();
            if (objectMonth > todayMonth){
                daysToFill = 0; // No marks for upcoming months
            } else if (objectMonth == todayMonth){
                daysToFill = today.getDate(); // Only mark until today for this month
            };
        };

        const expanded: DatesType = {};

        for (let day = 1; day <= daysToFill; day++) {
          const dateKey = `${objectYear}-${String(objectMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          if (inputData[dateKey]) {
            expanded[dateKey] = inputData[dateKey];
          } else {
            expanded[dateKey] = { units: 0 };
          };
        };
        
        return expanded;
    };


    const monthEntriesToColors = (sessions: DatesType) => {
        // MarkedDates object, see official react-native-calendars docs
        let markedDates: SessionsCalendarMarkedDates = Object.entries(sessions).reduce((
            acc: SessionsCalendarMarkedDates,
            [key, { units: value }]
        ) => {
            let color:string = unitsToColors(value);
            let textColor:string = 'black';
            if (color == 'red' || color == 'green'){
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

    const getMarkedDates = (dateObject: Date, drinkingSessionData: DrinkingSessionData[]): SessionsCalendarMarkedDates => {
        if (!drinkingSessionData) return {};

        const sessions = getSingleMonthDrinkingSessions(dateObject, drinkingSessionData, true);
        const aggergatedSessions = aggregateSessionsByDays(sessions);
        const monthTotalSessions = fillInRestOfMonth(dateObject, aggergatedSessions, true);
        return monthEntriesToColors(monthTotalSessions);
    };


    /** An explicit handler that fulfills the role of a useState, but
     * is called from within the Calendar object on month change.
     */
    const handleMonthChange = (newDate:DateObject) => {
        if (calendarData != null){
            const newDateObject = timestampToDate(newDate.timestamp);
            const newMarkedDates = getMarkedDates(newDateObject, calendarData);
            setMarkedDates(newMarkedDates);
        } else {
            setMarkedDates({});
        }
    };

    const currentMarkedDates = useMemo(() => {
        if (!calendarData) return {};

        let newDateObject = new Date();
        return getMarkedDates(newDateObject, calendarData);
    }, [calendarData]);


    useEffect(() => {
        setCalendarData(drinkingSessionData);
    }, [drinkingSessionData]);
    

    useEffect(() => {
        setMarkedDates(currentMarkedDates);
    }, [currentMarkedDates]);
     

    if (markedDates == null || drinkingSessionData == null) {
        return(
            <LoadingData
                loadingText='Loading data...'
            />
        );
    }

    return (
        <Calendar
        dayComponent={({ date, state, marking, theme }) => 
            <DayComponent 
                date={date as DateObject} 
                state={state as DayState} 
                marking={marking as any}
                theme={theme as any}
                onPress={onDayPress}
            />
        }
        onMonthChange={newDate => handleMonthChange(newDate)}
        markedDates={markedDates}
        markingType={'period'}
        firstDay={1}
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
        // backgroundColor:'green',
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
        // borderWidth: 1,
        // height: 350
    },
})