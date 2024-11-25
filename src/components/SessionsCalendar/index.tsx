import React, {useEffect, useState} from 'react';
import {DateData} from 'react-native-calendars';
import {Calendar} from 'react-native-calendars';
import {
  getPreviousMonth,
  getNextMonth,
  // monthEntriesToColors,
} from '@libs/DataHandling';
import type {
  DrinkingSessionArray,
  DrinkingSessionList,
  Preferences,
} from '@src/types/onyx';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import SessionsCalendarProps, {DayComponentProps} from './types';
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
import useLazyMarkedDates from '@hooks/useLazyMarkedDates';
import FlexibleLoadingIndicator from '@components/FlexibleLoadingIndicator';
import {MarkedDates} from 'react-native-calendars/src/types';

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
  const {markedDates, unitsMap, loadSessionsForMonth, isLoading} =
    useLazyMarkedDates(drinkingSessionData || {}, preferences);
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

  const handleLeftArrowPress = (subtractMonth: () => void) => {
    const previousMonth = getPreviousMonth(visibleDate);
    onDateChange(previousMonth);
    loadSessionsForMonth(previousMonth.year, previousMonth.month);
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

  useEffect(() => {
    setMinDate(calculateMinDate(drinkingSessionData));
  }, [drinkingSessionData]);

  if (isLoading) {
    return <FlexibleLoadingIndicator />;
  }

  return (
    <Calendar
      current={visibleDate.dateString}
      dayComponent={({date, state, marking, theme}: DayComponentProps) => {
        if (!date) return;
        return (
          <DayComponent
            date={date}
            state={state}
            units={unitsMap.get(date.dateString)}
            marking={marking}
            theme={theme}
            onPress={onDayPress}
          />
        );
      }}
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
