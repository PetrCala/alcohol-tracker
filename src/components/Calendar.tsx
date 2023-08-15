import React, { useEffect, useState } from 'react';
import { Calendar } from 'react-native-calendars';
import { createDateObject, timestampToDate, unitsToColors } from '../utils/dataHandling';
import { 
    SessionsCalendarProps,
    SessionsCalendarMarkedDates
} from '../types/various';
import { DrinkingSessionData } from '../types/database';
import { DateObject } from '../types/various';
import LoadingData from './LoadingData';
import styles from '../styles';

const SessionsCalendar = ({ drinkingSessionData, onDayPress} :SessionsCalendarProps) => {
    const [calendarData, setCalendarData ] = useState<DrinkingSessionData[] | null>(drinkingSessionData);
    const [markedDates, setMarkedDates] = useState<SessionsCalendarMarkedDates>({});

    type DatesType = {
        [key: string]: {
            units: number;
        }
    }

    const getMarkedDates = (drinkingSessionData: DrinkingSessionData[]) => {
        // Create a single object, "dates", that aggregates units
        // across dates
        let dates: DatesType =  drinkingSessionData.reduce((
            acc: { [key: string]: { units: number } },
            item: DrinkingSessionData
            ) => {
        let date = new Date(item.timestamp);
        let dateString = date.toISOString().split('T')[0]; // yyyy-MM-dd

        if (!acc[dateString]) {
            acc[dateString] = { units: item.units };
        } else {
            acc[dateString].units += item.units;
        }
        return acc;
        }, {});
        // MarkedDates object, see official react-native-calendars docs
        let markedDates: SessionsCalendarMarkedDates = Object.entries(dates).reduce((acc: SessionsCalendarMarkedDates, [key, { units }]) => {
            let color:string = unitsToColors(units);
            let textColor:string = 'black';
            if (color == 'red'){
                textColor = 'white';
            }
            acc[key] = { 
                color: color,
                textColor: textColor
            }
            return acc;
        }, {});
        return markedDates;
    };

    const getMarkedDatesWithGreen = (existingMarkedDates: SessionsCalendarMarkedDates, beginningDate:Date) => {
        const currentDate = new Date();
        let markedDates: SessionsCalendarMarkedDates = {};
        
        // Iterate through each day starting from previous month and set it to green
        beginningDate.setMonth(beginningDate.getMonth() - 1);
        beginningDate.setDate(beginningDate.getDate() - 15);
        for (let d = beginningDate; d < currentDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            markedDates[dateStr] = { 
                color: "green",
                textColor: "white"
            };
        }

        // Merge the existing marked dates, so they override the generated ones
        return { ...markedDates, ...existingMarkedDates };
    };
    
    /** An explicit handler that fulfills the role of a useState, but
     * is called from within the Calendar object on month change.
     */
    const handleMonthChange = (newDate:DateObject) => {
        const beginningDate = timestampToDate(newDate.timestamp);
        const newMarkedDates = getMarkedDatesWithGreen(markedDates, beginningDate);
        setMarkedDates(newMarkedDates);
    }

    useEffect(() => {
        setCalendarData(drinkingSessionData);
    }, [drinkingSessionData]);
    
    useEffect(() => {
        if (drinkingSessionData != null){
            const newDate = new Date();
            const markedDates = getMarkedDates(drinkingSessionData);
            const allMarkedDates = getMarkedDatesWithGreen(markedDates, newDate);
            setMarkedDates(allMarkedDates);
        } else {
            setMarkedDates({}); // No data remaining
        }
    }, [calendarData]);
     
    if (markedDates == null || drinkingSessionData == null) {
        return(
            <LoadingData
                loadingText='Loading data...'
            />
        );
    }

    return (
        <Calendar
        onDayPress = {onDayPress}
        onMonthChange={newDate => handleMonthChange(newDate)}
        markedDates={markedDates}
        markingType={'period'}
        style={styles.mainScreenCalendarStyle}
        theme={styles.mainScreenCalendarTheme}
        />
        );
    };
    
export default SessionsCalendar;
