import React, {useEffect, useMemo, useRef, useState} from 'react';
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
      const dayKey = format(sessionDate, 'yyyy-MM-dd');

      if (!index.has(dayKey)) {
        index.set(dayKey, []);
      }
      index.get(dayKey)!.push(session);
    });

    sessionIndex.current = index;

    // Clear markedDatesMap and unitsMap
    setMarkedDatesMap(new Map());
    setUnitsMap(new Map());

    // Load sessions for the current month
    loadSessionsForMonth(new Date().getFullYear(), new Date().getMonth() + 1);

    setIsLoading(false);
  }, [sessions, preferences]);

  const loadSessionsForMonth = (year: number, month: number) => {
    const endOfMonth = new Date(year, month, 0);

    for (let day = 1; day <= endOfMonth.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      const dayKey = format(date, 'yyyy-MM-dd');
      loadSessionsForDay(dayKey);
    }
  };

  // Function to load sessions for a specific month
  const loadSessionsForDay = (dayKey: string) => {
    if (markedDatesMap.has(dayKey)) {
      return;
    }

    const relevantSessions = sessionIndex.current.get(dayKey) || [];
    const newMarking = sessionsToDayMarking(relevantSessions, preferences);

    if (!newMarking) {
      return;
    }

    setMarkedDatesMap(prev => new Map(prev).set(dayKey, newMarking.marking));
    setUnitsMap(prev => new Map(prev).set(dayKey, newMarking.units));
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
