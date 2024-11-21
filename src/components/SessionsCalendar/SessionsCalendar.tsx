import React, {useEffect, useState} from 'react';
import {DateData} from 'react-native-calendars';
import {
  Dimensions,
  // Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {
  getPreviousMonth,
  getNextMonth,
  aggregateSessionsByDays,
  monthEntriesToColors,
} from '@libs/DataHandling';
import type {DrinkingSessionArray, Preferences} from '@src/types/onyx';
import useTheme from '@hooks/useTheme';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import SessionsCalendarProps, {
  DayComponentProps,
  SessionsCalendarMarkedDates,
} from './types';

function SessionsCalendar({
  userID,
  drinkingSessionData,
  preferences,
  onDateChange,
}: SessionsCalendarProps) {
  const theme = useTheme();
  const styles = useThemeStyles();
  const [date, setDate] = useState<DateData>(new Date().getTime());

  const [calendarData, setCalendarData] = useState<DrinkingSessionArray>(
    drinkingSessionData ? Object.values(drinkingSessionData) : [],
  );
  const [markedDates, setMarkedDates] = useState<SessionsCalendarMarkedDates>(
    {},
  );
  const [loadingMarkedDates, setLoadingMarkedDays] = useState<boolean>(true);

  const getMarkedDates = (
    calendarData: DrinkingSessionArray,
    preferences: Preferences,
  ): SessionsCalendarMarkedDates => {
    // Use points to calculate the point sum (flagged as units)
    const aggergatedSessions = aggregateSessionsByDays(
      calendarData,
      'units',
      preferences.drinks_to_units,
    );
    const newMarkedDates = monthEntriesToColors(
      aggergatedSessions,
      preferences,
    );
    return newMarkedDates;
  };

  /** Handler for the left arrow calendar press. Uses a callback to
   * move to the previous month
   *
   * @param subtractMonth A callback to move the months
   */
  const handleLeftArrowPress = (subtractMonth: () => void) => {
    const previousMonth = getPreviousMonth(visibleDateObject);
    if (onDateChange) {
      onDateChange(previousMonth);
    }
    dispatch({type: 'SET_VISIBLE_DATE_OBJECT', payload: previousMonth});
    subtractMonth(); // Use the callback to move to the previous month
  };

  /** Handler for the left arrow calendar press. Uses a callback to
   * move to the following month
   *
   * @param addMonth A callback to move the months
   */
  const handleRightArrowPress = (addMonth: () => void) => {
    const nextMonth = getNextMonth(visibleDateObject);
    dispatch({type: 'SET_VISIBLE_DATE_OBJECT', payload: nextMonth});
    addMonth(); // Use the callback to move to the next month
  };

  // Monitor the local calendarData hook that depends on the drinking session data
  useEffect(() => {
    const newData = drinkingSessionData
      ? Object.values(drinkingSessionData)
      : [];
    setCalendarData(newData);
  }, [drinkingSessionData]);

  // Monitor marked days
  useEffect(() => {
    const newMarkedDates = getMarkedDates(calendarData, preferences);
    setMarkedDates(newMarkedDates);
    setLoadingMarkedDays(false);
  }, [calendarData, preferences]);

  if (loadingMarkedDates) {
    return <FullScreenLoadingIndicator />;
  }

  return (
    <Calendar
      current={visibleDateObject.dateString}
      dayComponent={({date, state, marking, theme}: DayComponentProps) => (
        <DayComponent
          date={date}
          state={state}
          marking={marking}
          theme={theme}
          onPress={onDayPress}
        />
      )}
      monthFormat={CONST.DATE.MONTH_YEAR_ABBR_FORMAT}
      onPressArrowLeft={(subtractMonth: () => void) =>
        handleLeftArrowPress(subtractMonth)
      }
      onPressArrowRight={(addMonth: () => void) =>
        handleRightArrowPress(addMonth)
      }
      markedDates={markedDates}
      markingType={'period'}
      firstDay={preferences.first_day_of_week === 'Monday' ? 1 : 0}
      enableSwipeMonths={false}
      disableAllTouchEventsForDisabledDays={true}
      renderArrow={CustomArrow}
      style={[
        localStyles.mainScreenCalendarStyle,
        {
          borderColor: theme.border,
        },
      ]}
      theme={
        {
          textDayHeaderFontWeight: 'bold',
          'stylesheet.calendar.header': {
            header: {
              width: screenWidth,
              marginLeft: -5,
              flexDirection: 'row',
              alignItems: 'center',
              borderTopWidth: 1,
              borderColor: theme.border,
            },
            monthText: {
              color: theme.text,
              fontSize: 20,
              fontWeight: '500',
              width: screenWidth / 3,
              textAlign: 'center',
            },
          },
        } as any
      } // Circumvent typescript gymnastics
    />
  );
}

const screenWidth = Dimensions.get('window').width;

const localStyles = StyleSheet.create({
  // Day component styles
  dayContainer: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: '#E0E0E0',
    width: '100%', // Give explicit width and height
    height: 50,
    // borderRadius: 4, // Rounded corners
  },
  dayText: {
    marginTop: 1,
    marginLeft: 2,
    fontSize: 10,
    alignSelf: 'flex-start',
    color: 'black' as string, // allow overrides
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
    borderTopWidth: 0,
    borderBottomWidth: 1,
    flexGrow: 1,
    flexShrink: 1,
  },
});

SessionsCalendar.displayName = 'SessionsCalendar';
export default SessionsCalendar;
