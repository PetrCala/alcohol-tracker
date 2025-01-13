import ONYXKEYS from '@src/ONYXKEYS';
import Onyx from 'react-native-onyx';

function setSessionsCalendarMonthsLoaded(monthsLoaded: number): void {
  Onyx.merge(ONYXKEYS.SESSIONS_CALENDAR_MONTHS_LOADED, monthsLoaded);
}

export {
  // eslint-disable-next-line import/prefer-default-export
  setSessionsCalendarMonthsLoaded,
};
