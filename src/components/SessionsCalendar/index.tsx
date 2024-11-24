import React, {useEffect, useState} from 'react';
import {DateData} from 'react-native-calendars';
import {Calendar} from 'react-native-calendars';
import {
  getPreviousMonth,
  getNextMonth,
  aggregateSessionsByDays,
  monthEntriesToColors,
} from '@libs/DataHandling';
import type {DrinkingSessionArray, Preferences} from '@src/types/onyx';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import SessionsCalendarProps, {
  DayComponentProps,
  SessionsCalendarMarkedDates,
} from './types';
import CalendarArrow from './CalendarArrow';
import type {Direction} from './CalendarArrow';
import DayComponent from './DayComponent';
import {format} from 'date-fns';
import {auth} from '@libs/Firebase/FirebaseApp';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import {DateString} from '@src/types/time';
import useStyleUtils from '@hooks/useStyleUtils';
import _ from 'lodash';
import useLazySessions from '@hooks/useLazySessions';

function SessionsCalendar({
  userID,
  visibleDate,
  onDateChange,
  drinkingSessionData,
  preferences,
}: SessionsCalendarProps) {
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const user = auth?.currentUser;

  const {loadedSessions, loadSessionsForMonth} = useLazySessions(
    drinkingSessionData || {},
  );
  const [markedDates, setMarkedDates] = useState<SessionsCalendarMarkedDates>(
    {},
  );
  const [loadingMarkedDates, setLoadingMarkedDays] = useState<boolean>(true);
  const [minDate, setMinDate] = useState<string>(CONST.DATE.MIN_DATE);

  const calculateMinDate = (data: DrinkingSessionArray): string => {
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

  const handleLeftArrowPress = (subtractMonth: () => void) => {
    const previousMonth = getPreviousMonth(visibleDate);
    onDateChange(previousMonth);
    loadSessionsForMonth(previousMonth.year, previousMonth.month - 3);
    subtractMonth(); // Use the callback to move to the previous month
  };

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

  // Monitor marked days
  useEffect(() => {
    const newMarkedDates = getMarkedDates(loadedSessions, preferences);
    const newMinDate = calculateMinDate(loadedSessions);

    setMarkedDates(newMarkedDates);
    setMinDate(newMinDate);
    setLoadingMarkedDays(false);
    // }, [loadedSessions, preferences]);
  }, [preferences]);

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
      renderArrow={(direction: Direction) => CalendarArrow(direction)}
      style={styles.sessionsCalendarContainer}
      theme={StyleUtils.getSessionsCalendarHeaderStyle()}
    />
  );
}

SessionsCalendar.displayName = 'SessionsCalendar';
export default SessionsCalendar;
