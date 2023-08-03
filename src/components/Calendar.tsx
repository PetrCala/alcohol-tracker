import React, { useEffect, useState } from 'react';
import { Calendar } from 'react-native-calendars';
import { unitsToColors } from '../utils/dataHandling';
import { SessionsCalendarProps, 
    SessionsCalendarMarkedDates,
    DrinkingSessionData
} from '../utils/types';
import LoadingData from './loadingData';

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
            acc[key] = { color: color }
            // acc[key] = { customStyles: {
            //     container: {
            //             backgroundColor: color
            //         }
            //     }
            // };
            return acc;
        }, {});
        return markedDates;
    };

    useEffect(() => {
        setCalendarData(drinkingSessionData);
    }, [drinkingSessionData]);

    useEffect(() => {
        if (drinkingSessionData != null){
            const markedDates = getMarkedDates(drinkingSessionData);
            setMarkedDates(markedDates);
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
        markedDates={markedDates}
        markingType={'period'}
        />
        );
    };
    
export default SessionsCalendar;
