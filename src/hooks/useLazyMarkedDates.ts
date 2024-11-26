import {useEffect, useMemo, useRef, useState} from 'react';
import {utcToZonedTime} from 'date-fns-tz';
import {
  DrinkingSessionArray,
  DrinkingSessionList,
  Preferences,
} from '@src/types/onyx';
import CONST from '@src/CONST';
import _ from 'lodash';
import {
  differenceInMonths,
  eachDayOfInterval,
  format,
  isWithinInterval,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import {sessionsToDayMarking} from '@libs/DataHandling';
import {MarkingProps} from 'react-native-calendars/src/calendar/day/marking';
import {MarkedDates} from 'react-native-calendars/src/types';

type DateString = string;

/**
 * Custom hook to manage and memoize drinking session data with lazy loading
 * @param sessions Record of sessions keyed by session ID, can be null or undefined
 * @param preferences User's preferences
 * @returns Marked dates and units for the calendar
 */
function useLazyMarkedDates(
  sessions: DrinkingSessionList,
  preferences: Preferences,
) {
  const [markedDatesMap, setMarkedDatesMap] = useState<
    Map<DateString, MarkingProps>
  >(new Map());
  const [unitsMap, setUnitsMap] = useState<Map<DateString, number>>(new Map());
  const sessionIndex = useRef<Map<DateString, DrinkingSessionArray>>(new Map()); // synchronous
  const loadedFrom = useRef<Date | null>(null);
  const [monthsLoaded, setMonthsLoaded] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const defaultTimezone = CONST.DEFAULT_TIME_ZONE.selected;

  /** Check up to which data the data has already loaded and return the date to load from. This date will capture one more month than the last loaded month. Always load one more day than the first day of the month in order to handle timezone modifications.
   */
  const getDateToLoadFrom = (monthsToLoad: number = 1): Date => {
    const today = new Date();
    const alreadyLoaded = loadedFrom.current;
    const monthsDifference = differenceInMonths(today, alreadyLoaded ?? today);
    const monthsToSubtract = monthsDifference + monthsToLoad;
    const dateInCorrectMonth = subMonths(today, monthsToSubtract);
    return subDays(startOfMonth(dateInCorrectMonth), 1);
  };

  // Internal function to load sessions for a specific day into provided maps
  const loadSessionsForDayInternal = (
    dayKey: DateString,
    markedDatesMapToUpdate: Map<DateString, MarkingProps>,
    unitsMapToUpdate: Map<DateString, number>,
  ) => {
    const relevantSessions = sessionIndex.current.get(dayKey) || [];
    const newMarking = sessionsToDayMarking(relevantSessions, preferences);
    if (!newMarking) {
      return;
    }
    markedDatesMapToUpdate.set(dayKey, newMarking.marking);
    unitsMapToUpdate.set(dayKey, newMarking.units);
  };

  // Internal function to load sessions for a specific month into provided maps
  const loadSessionsForMonthsInternal = (
    monthsToLoad: number,
    markedDatesMapToUpdate: Map<DateString, MarkingProps>,
    unitsMapToUpdate: Map<DateString, number>,
  ) => {
    const index = sessionIndex.current;
    const start = getDateToLoadFrom(monthsToLoad);
    const end = loadedFrom.current ?? new Date();

    const relevantSessions = Object.values(sessions).filter(session =>
      isWithinInterval(session.start_time, {start, end}),
    );

    // Build the sessionIndex for relevant sessions
    _.forEach(relevantSessions, session => {
      const sessionDate = utcToZonedTime(
        session.start_time,
        session.timezone ?? defaultTimezone,
      );
      const dayKey = format(sessionDate, CONST.DATE.FNS_FORMAT_STRING);

      if (!index.has(dayKey)) {
        index.set(dayKey, []);
      }
      index.get(dayKey)!.push(session);
    });

    const datesToLoad = eachDayOfInterval({start, end});
    const dayStrings = _.map(datesToLoad, date =>
      format(date, CONST.DATE.FNS_FORMAT_STRING),
    );

    // Mark the dates and units for each day
    _.forEach(dayStrings, dayKey => {
      loadSessionsForDayInternal(
        dayKey,
        markedDatesMapToUpdate,
        unitsMapToUpdate,
      );
    });
    loadedFrom.current = start;
    setMonthsLoaded(prev => prev + monthsToLoad);
  };

  const loadMoreMonths = (monthsToLoad: number = 1) => {
    // Use existing state maps as a base
    const newMarkedDatesMap = new Map(markedDatesMap);
    const newUnitsMap = new Map(unitsMap);

    loadSessionsForMonthsInternal(monthsToLoad, newMarkedDatesMap, newUnitsMap);

    setMarkedDatesMap(newMarkedDatesMap);
    setUnitsMap(newUnitsMap);
  };

  // Memoize the markedDates to avoid unnecessary re-renders
  const markedDates: MarkedDates = useMemo(
    () => Object.fromEntries(markedDatesMap),
    [markedDatesMap],
  );

  useEffect(() => {
    setIsLoading(true);
    loadedFrom.current = null;
    // Resetting the session index causes recalculation of of dependent hooks when necssary, so it is not needed to reset them here
    sessionIndex.current = new Map<DateString, DrinkingSessionArray>();

    // If this is the first time loading, load the current month only
    // If more data have already been loaded, reload the same amount of months
    loadMoreMonths(monthsLoaded);
    setIsLoading(false);
  }, [sessions, preferences]);

  return {
    markedDates,
    unitsMap,
    loadedFrom,
    loadMoreMonths,
    isLoading,
  };
}

export default useLazyMarkedDates;
