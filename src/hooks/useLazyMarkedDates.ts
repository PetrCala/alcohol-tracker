import React, {useEffect, useMemo, useRef, useState} from 'react';
import {utcToZonedTime} from 'date-fns-tz';
import {
  DrinkingSession,
  DrinkingSessionList,
  Preferences,
} from '@src/types/onyx';
import CONST from '@src/CONST';
import _, {has} from 'lodash';
import {format} from 'date-fns';
import {sessionsToDayMarking} from '@libs/DataHandling';
import {MarkingProps} from 'react-native-calendars/src/calendar/day/marking';
import {MarkedDates} from 'react-native-calendars/src/types';

/**
 * Custom hook to manage and memoize drinking session data with lazy loading
 * @param sessions Record of sessions keyed by session ID, can be null or undefined
 * @returns  An object containing loaded sessions and a function to load for a specific month
 */
function useLazyMarkedDates(
  sessions: DrinkingSessionList,
  preferences: Preferences,
) {
  const [markedDatesMap, setMarkedDatesMap] = useState<
    Map<string, MarkingProps>
  >(new Map());
  const [unitsMap, setUnitsMap] = useState<Map<string, number>>(new Map());
  const sessionIndex = useRef<Map<string, string[]>>(new Map());
  const hasRendered = useRef(false);
  const isLoading = useRef(true);
  const defaultTimezone = CONST.DEFAULT_TIME_ZONE.selected;

  // Build the index when sessions change
  useEffect(() => {
    if (hasRendered) {
      const index = new Map<string, string[]>();

      Object.entries(sessions).forEach(([id, session]) => {
        const sessionDate = utcToZonedTime(
          session.start_time,
          session.timezone ?? defaultTimezone,
        );
        const dayKey = format(sessionDate, 'yyyy-MM-dd');

        if (!index.has(dayKey)) {
          index.set(dayKey, []);
        }
        index.get(dayKey)!.push(id);
      });

      sessionIndex.current = index;
    }
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

    const sessionIds = sessionIndex.current.get(dayKey) || [];
    const relevantSessions = _.pick(sessions, sessionIds);
    const sessionsArray = _.values(relevantSessions);
    const newMarking = sessionsToDayMarking(sessionsArray, preferences);

    if (!newMarking) {
      return;
    }

    markedDatesMap.set(dayKey, newMarking.marking);
    unitsMap.set(dayKey, newMarking.units);

    setMarkedDatesMap(new Map(markedDatesMap));
    setUnitsMap(new Map(unitsMap));
  };

  // Initial load of the current month and the previous two months
  React.useEffect(() => {
    console.log('running');
    if (hasRendered.current) {
      loadSessionsForMonth(new Date().getFullYear(), new Date().getMonth() + 1);
      isLoading.current = false;
    }
    hasRendered.current = true;
  }, [hasRendered.current, sessions]);

  // This is crucial to avoid reprocessing sessions on every render
  const markedDates: MarkedDates = useMemo(
    () => Object.fromEntries(markedDatesMap),
    [markedDatesMap],
  );

  return {
    markedDates,
    unitsMap,
    loadSessionsForMonth,
    isLoading: isLoading.current,
  };
}

export default useLazyMarkedDates;
