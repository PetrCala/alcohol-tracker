import React, { useEffect, useState } from 'react';
import { Calendar } from 'react-native-calendars';
import { unitsToColors } from '../utils/dataHandling';
import { DrinkingSessionData, CalendarDataItem, CalendarMarkedDates  } from '../utils/types';


interface SessionsCalendarProps {
    drinkingSessionData: DrinkingSessionData;
    onDayPress: (day: any) => void;
  }



const SessionsCalendar = ({ drinkingSessionData, onDayPress} :SessionsCalendarProps) => {
  const [markedDates, setMarkedDates] = useState<CalendarMarkedDates>({});

  useEffect(() => {
    // const dates = data.reduce((acc: { [key: string]: { units: number } }, item: IDataItem) => {
    //   const date = new Date(item.timestamp);
    //   const dateString = date.toISOString().split('T')[0]; // yyyy-MM-dd

    //   if (!acc[dateString]) {
    //     acc[dateString] = { units: item.units };
    //   } else {
    //     acc[dateString].units += item.units;
    //   }
    //   return acc;
    // }, {});
    
    // const colors: IMarkedDates = Object.entries(dates).reduce((acc, [key, { units }]) => {
        //   let color = unitsToColors(units);
        
        //   acc[key] = { customStyles: { container: { backgroundColor: color } } };
        //   return acc;
        // }, {});
        
        // setMarkedDates(colors);
    }, [drinkingSessionData]);  // Here, include data as a dependency

//   return <Calendar markedDates={markedDates} markingType={'custom'} />;
    return (
        <Calendar
            onDayPress = {onDayPress}
            markedDates={markedDates}
        />
    );
};

export default SessionsCalendar;
