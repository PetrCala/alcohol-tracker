import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import type {MarkingTypes} from 'react-native-calendars/src/types';
import type {DateData} from 'react-native-calendars';
import {Calendar} from 'react-native-calendars';
import _ from 'lodash';
import {getPreviousMonth, getNextMonth} from '@libs/DataHandling';
import type {DrinkingSessionList} from '@src/types/onyx';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {differenceInMonths, format} from 'date-fns';
import {auth} from '@libs/Firebase/FirebaseApp';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {DateString} from '@src/types/time';
import useStyleUtils from '@hooks/useStyleUtils';
import useLazyMarkedDates from '@hooks/useLazyMarkedDates';
import FlexibleLoadingIndicator from '@components/FlexibleLoadingIndicator';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import DayComponent from './DayComponent';
import type {Direction} from './CalendarArrow';
import type SessionsCalendarProps from './types';
import type {DayComponentProps} from './types';
import CalendarArrow from './CalendarArrow';
import setCalendarLocale from './setCalendarLocale';
import useTheme from '@hooks/useTheme';

function SessionsCalendar({
  userID,
  visibleDate,
  onDateChange,
  drinkingSessionData,
  preferences,
}: SessionsCalendarProps) {
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const theme = useTheme();
  const user = auth?.currentUser;
  const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE);
  const {markedDates, unitsMap, loadedFrom, loadMoreMonths, isLoading} =
    useLazyMarkedDates(userID, drinkingSessionData || {}, preferences);
  const [minDate, setMinDate] = useState<string>(CONST.DATE.MIN_DATE);
  const [locale, setLocale] = useState<string>(CONST.LOCALES.DEFAULT);

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
    const monthsAway = differenceInMonths(
      new Date(visibleDate.timestamp),
      new Date(loadedFrom?.current ?? new Date()),
    );
    if (monthsAway <= 1) {
      loadMoreMonths(1);
    }

    const previousMonth = getPreviousMonth(visibleDate);
    onDateChange(previousMonth);

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

  const dayComponent = useCallback(
    ({date, state, marking, theme}: DayComponentProps) => (
      <DayComponent
        date={date}
        state={state}
        units={date ? unitsMap.get(date.dateString) : 0}
        marking={marking}
        theme={theme}
        onPress={onDayPress}
      />
    ),
    [unitsMap, onDayPress],
  );

  const calendarProps = useMemo(
    () => ({
      current: visibleDate.dateString,
      dayComponent,
      minDate,
      maxDate: format(new Date(), CONST.DATE.CALENDAR_FORMAT),
      monthFormat: CONST.DATE.MONTH_YEAR_ABBR_FORMAT, // e.g. "Mar 2024"
      onPressArrowLeft: handleLeftArrowPress,
      onPressArrowRight: handleRightArrowPress,
      markedDates,
      markingType: 'period' as MarkingTypes,
      firstDay: CONST.WEEK_STARTS_ON, // e.g. Monday = 1
      enableSwipeMonths: false,
      disableAllTouchEventsForDisabledDays: true,
      renderArrow: (direction: Direction) => CalendarArrow(direction),
      style: styles.sessionsCalendarContainer,
      theme: StyleUtils.getSessionsCalendarStyle(),
      locale,
    }),
    [
      visibleDate.dateString,
      dayComponent,
      minDate,
      handleLeftArrowPress,
      handleRightArrowPress,
      markedDates,
      styles.sessionsCalendarContainer,
      StyleUtils.getSessionsCalendarStyle,
      locale,
    ],
  );

  useEffect(() => {
    setMinDate(calculateMinDate(drinkingSessionData));
  }, [drinkingSessionData]);

  useEffect(() => {
    const newLocale = preferredLocale ?? CONST.LOCALES.DEFAULT;
    setCalendarLocale(newLocale);
    setLocale(newLocale);
  }, [preferredLocale]);

  if (isLoading) {
    return <FlexibleLoadingIndicator />;
  }

  return <Calendar {...calendarProps} />;
  // {TODO implement this}
  //   {
  //     /* <Calendar
  //         initialDate=""
  //         context={{ date : '' }} // Disable marking of today
  //         markingType="custom"
  //         markedDates={reservedDates}
  //         renderHeader={date => <Text>{moment(new Date(date)).format('YYYY MMMM')}</Text>}
  //         enableSwipeMonths
  // /> */
  //   }
}

SessionsCalendar.displayName = 'SessionsCalendar';
export default memo(SessionsCalendar);
