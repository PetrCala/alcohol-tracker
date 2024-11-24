import React, {useEffect, useState} from 'react';
import {DateData} from 'react-native-calendars';
import {Dimensions, StyleSheet} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {
  getPreviousMonth,
  getNextMonth,
  aggregateSessionsByDays,
  monthEntriesToColors,
} from '@libs/DataHandling';
import type {
  DrinkingSessionArray,
  DrinkingSessionList,
  Preferences,
} from '@src/types/onyx';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import useTheme from '@hooks/useTheme';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import SessionsCalendarProps, {
  DayComponentProps,
  SessionsCalendarMarkedDates,
} from './types';
import CalendarArrow from './CalendarArrow';
import DayComponent from './DayComponent';
import {format} from 'date-fns';
import {auth} from '@libs/Firebase/FirebaseApp';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import {DateString} from '@src/types/time';

function SessionsCalendar({
  userID,
  visibleDate,
  onDateChange,
  drinkingSessionData,
  preferences,
}: SessionsCalendarProps) {
  const theme = useTheme();
  const styles = useThemeStyles();
  const user = auth?.currentUser;

  const [calendarData, setCalendarData] = useState<DrinkingSessionArray>(
    drinkingSessionData ? Object.values(drinkingSessionData) : [],
  );
  const [markedDates, setMarkedDates] = useState<SessionsCalendarMarkedDates>(
    {},
  );
  const [loadingMarkedDates, setLoadingMarkedDays] = useState<boolean>(true);
  const [minDate, setMinDate] = useState<string>(CONST.DATE.MIN_DATE);

  const calculateMinDate = (
    data: DrinkingSessionList | null | undefined,
  ): string => {
    const trackingStartDate = DSUtils.getUserTrackingStartDate(data);

    if (!trackingStartDate) {
      return CONST.DATE.MIN_DATE;
    }
    return format(trackingStartDate, CONST.DATE.CALENDAR_FORMAT);
  };

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
    const previousMonth = getPreviousMonth(visibleDate);
    onDateChange(previousMonth);
    subtractMonth(); // Use the callback to move to the previous month
  };

  /** Handler for the left arrow calendar press. Uses a callback to
   * move to the following month
   *
   * @param addMonth A callback to move the months
   */
  const handleRightArrowPress = (addMonth: () => void) => {
    const nextMonth = getNextMonth(visibleDate);
    onDateChange(nextMonth);
    addMonth(); // Use the callback to move to the next month
  };

  const onDayPress = (date: DateData) => {
    if (userID === user?.uid) {
      Navigation.navigate(
        ROUTES.DAY_OVERVIEW.getRoute(date.dateString as DateString),
      );
    }
    // TODO display other user's sessions too in a clever manner
  };

  // Monitor the local calendarData hook that depends on the drinking session data
  useEffect(() => {
    const newData = drinkingSessionData
      ? Object.values(drinkingSessionData)
      : [];
    const newMinDate = calculateMinDate(drinkingSessionData);

    setCalendarData(newData);
    setMinDate(newMinDate);
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
      current={visibleDate.dateString}
      dayComponent={({date, state, marking, theme}: DayComponentProps) => (
        <DayComponent
          date={date}
          state={state}
          marking={marking}
          theme={theme}
          onPress={onDayPress}
        />
      )}
      minDate={minDate}
      maxDate={format(new Date(), CONST.DATE.CALENDAR_FORMAT)} // today
      monthFormat={CONST.DATE.MONTH_YEAR_ABBR_FORMAT}
      onPressArrowLeft={(subtractMonth: () => void) =>
        handleLeftArrowPress(subtractMonth)
      }
      onPressArrowRight={(addMonth: () => void) =>
        handleRightArrowPress(addMonth)
      }
      markedDates={markedDates}
      markingType={'period'}
      firstDay={CONST.WEEK_STARTS_ON}
      enableSwipeMonths={false}
      disableAllTouchEventsForDisabledDays={true}
      renderArrow={CalendarArrow}
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
