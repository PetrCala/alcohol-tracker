import React from 'react';
import {utcToZonedTime} from 'date-fns-tz';
import {DrinkingSession, DrinkingSessionList} from '@src/types/onyx';
import CONST from '@src/CONST';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {auth} from '@libs/Firebase/FirebaseApp';
import {Timezone} from '@src/types/onyx/UserData';
import _ from 'lodash';

let timezone: Required<Timezone> = CONST.DEFAULT_TIME_ZONE;
Onyx.connect({
  key: ONYXKEYS.USER_DATA_LIST,
  callback: value => {
    if (!auth?.currentUser) {
      return;
    }
    const currentUserID = auth?.currentUser?.uid;
    const userDataTimezone = value?.[currentUserID]?.timezone;
    timezone = {
      selected: userDataTimezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected,
      automatic:
        userDataTimezone?.automatic ?? CONST.DEFAULT_TIME_ZONE.automatic,
    };
  },
});

/**
 * Custom hook to manage and memoize drinking session data with lazy loading
 * @param sessions Record of sessions keyed by session ID, can be null or undefined
 * @returns  An object containing loaded sessions and a function to load for a specific month
 */
function useLazySessions(sessions: DrinkingSessionList) {
  const [loadedSessions, setLoadedSessions] = React.useState<
    Map<string, DrinkingSession>
  >(new Map());
  const defaultTimezone = timezone?.selected;

  // Ref to hold processed sessions and avoid reprocessing
  const sessionCache = React.useRef<Map<string, DrinkingSession>>(new Map());

  // Index to map months to session IDs for quick retrieval
  const sessionIndex = React.useRef<Map<string, string[]>>(new Map());

  // Build the index when sessions change
  React.useEffect(() => {
    const index = new Map<string, string[]>();

    Object.entries(sessions).forEach(([id, session]) => {
      const sessionStartTimeInTimezone = utcToZonedTime(
        session.start_time,
        session.timezone ?? defaultTimezone,
      );

      // Create a month key in the format 'YYYY-MM'
      const monthKey = `${sessionStartTimeInTimezone.getFullYear()}-${sessionStartTimeInTimezone.getMonth() + 1}`;

      if (!index.has(monthKey)) {
        index.set(monthKey, []);
      }
      index.get(monthKey)!.push(id);
    });

    sessionIndex.current = index;
  }, [sessions]);

  // Function to process a session (heavy calculation)
  const processSession = (session: DrinkingSession): DrinkingSession => {
    return session;
    // // ... perform heavy calculations here
    // return {
    //   id: session.id,
    //   // ... other processed attributes
    // };
  };

  // Function to load sessions for a specific month
  const loadSessionsForMonth = (year: number, month: number) => {
    const monthKey = `${year}-${month}`;
    const sessionIds = sessionIndex.current.get(monthKey) || [];
    const newLoadedSessions = new Map(loadedSessions);

    sessionIds.forEach(id => {
      if (!sessionCache.current.has(id)) {
        const session = sessions[id];
        const calculatedSession = processSession(session);
        sessionCache.current.set(id, calculatedSession);
        newLoadedSessions.set(id, calculatedSession);
      } else if (!loadedSessions.has(id)) {
        newLoadedSessions.set(id, sessionCache.current.get(id)!);
      }
    });

    setLoadedSessions(newLoadedSessions);
  };

  // Initial load of the current month and the previous two months
  React.useEffect(() => {
    const today = new Date();
    const monthsToLoad = [];

    for (let i = 0; i < 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      monthsToLoad.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      });
    }

    monthsToLoad.forEach(({year, month}) => {
      loadSessionsForMonth(year, month);
    });
  }, [sessions]);

  return {
    loadedSessions: Array.from(loadedSessions.values()),
    loadSessionsForMonth,
  };
}

export default useLazySessions;

// // Usage in a component
// const CalendarComponent = ({ sessions }: { sessions: Record<string, Session> }) => {
//   const { loadedSessions, loadSessionsForMonth } = useLazySessions(sessions);

//   // Handler for changing the calendar month
//   const handleMonthChange = (year: number, month: number) => {
//     loadSessionsForMonth(year, month);
//   };

//   return (
//     <div>
//       {/* Render the calendar UI here */}
//       {loadedSessions.map((session) => (
//         <div key={session.id}>
//           {/* Render session details */}
//         </div>
//       ))}
//       {/* Controls to change the month */}
//       <button onClick={() => handleMonthChange(2023, 12)}>Load December 2023</button>
//     </div>
//   );
// };
