import {useEffect, useMemo, useRef, useState} from 'react';
import {utcToZonedTime} from 'date-fns-tz';
import {
  DrinkingSessionArray,
  DrinkingSessionList,
  Preferences,
} from '@src/types/onyx';
import CONST from '@src/CONST';
import _ from 'lodash';
import {format} from 'date-fns';
import {sessionsToDayMarking} from '@libs/DataHandling';
import {MarkingProps} from 'react-native-calendars/src/calendar/day/marking';
import {MarkedDates} from 'react-native-calendars/src/types';

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
    Map<string, MarkingProps>
  >(new Map());
  const [unitsMap, setUnitsMap] = useState<Map<string, number>>(new Map());
  const sessionIndex = useRef<Map<string, DrinkingSessionArray>>(new Map()); // synchronous
  const [isLoading, setIsLoading] = useState(true);
  const defaultTimezone = CONST.DEFAULT_TIME_ZONE.selected;

  // Build the index when sessions change
  useEffect(() => {
    const index = new Map<string, DrinkingSessionArray>();

    Object.values(sessions).forEach(session => {
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

    // Reset the index and load sessions for the current month
    const newMarkedDatesMap = new Map<string, MarkingProps>();
    const newUnitsMap = new Map<string, number>();

    sessionIndex.current = index;

    // Load sessions for the current month
    loadSessionsForMonthInternal(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      newMarkedDatesMap,
      newUnitsMap,
    );

    setMarkedDatesMap(newMarkedDatesMap);
    setUnitsMap(newUnitsMap);

    setIsLoading(false);
  }, [sessions, preferences]);

  // Internal function to load sessions for a specific month into provided maps
  const loadSessionsForMonthInternal = (
    year: number,
    month: number,
    markedDatesMapToUpdate: Map<string, MarkingProps>,
    unitsMapToUpdate: Map<string, number>,
  ) => {
    const endOfMonth = new Date(year, month, 0);

    for (let day = 1; day <= endOfMonth.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      const dayKey = format(date, 'yyyy-MM-dd');
      loadSessionsForDayInternal(
        dayKey,
        markedDatesMapToUpdate,
        unitsMapToUpdate,
      );
    }
  };

  // Internal function to load sessions for a specific day into provided maps
  const loadSessionsForDayInternal = (
    dayKey: string,
    markedDatesMapToUpdate: Map<string, MarkingProps>,
    unitsMapToUpdate: Map<string, number>,
  ) => {
    if (markedDatesMapToUpdate.has(dayKey)) {
      return;
    }

    const relevantSessions = sessionIndex.current.get(dayKey) || [];
    const newMarking = sessionsToDayMarking(relevantSessions, preferences);

    if (!newMarking) {
      return;
    }

    markedDatesMapToUpdate.set(dayKey, newMarking.marking);
    unitsMapToUpdate.set(dayKey, newMarking.units);
  };

  const loadSessionsForMonth = (year: number, month: number) => {
    // Use existing state maps as a base
    const newMarkedDatesMap = new Map(markedDatesMap);
    const newUnitsMap = new Map(unitsMap);

    loadSessionsForMonthInternal(year, month, newMarkedDatesMap, newUnitsMap);

    setMarkedDatesMap(newMarkedDatesMap);
    setUnitsMap(newUnitsMap);
  };

  // Memoize the markedDates to avoid unnecessary re-renders
  const markedDates: MarkedDates = useMemo(
    () => Object.fromEntries(markedDatesMap),
    [markedDatesMap],
  );

  return {
    markedDates,
    unitsMap,
    loadSessionsForMonth,
    isLoading,
  };
}

export default useLazyMarkedDates;
