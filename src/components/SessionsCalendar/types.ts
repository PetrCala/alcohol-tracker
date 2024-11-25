import {DrinkingSessionList, Preferences} from '@src/types/onyx';
import type {DayComponentProps, CalendarColors} from './DayComponent/types';
import {UserID} from '@src/types/onyx/OnyxCommon';
import {DateData} from 'react-native-calendars';
import {MarkingProps} from 'react-native-calendars/src/calendar/day/marking';

type SessionsCalendarProps = {
  /** ID of the user for which to render the calendar */
  userID: UserID;

  /** The currently visible date */
  visibleDate: DateData;

  /** Callback for when the date changes */
  onDateChange: (date: DateData) => void;

  /** The drinking session to render */
  drinkingSessionData: DrinkingSessionList | null | undefined;

  /** User's preferences */
  preferences: Preferences;
};

type SessionsCalendarDayMarking = {
  marking: MarkingProps;
  units: number;
};
type SessionsCalendarMarkedDates = Record<string, SessionsCalendarDayMarking>;

export default SessionsCalendarProps;
export type {
  DayComponentProps,
  CalendarColors,
  SessionsCalendarDayMarking,
  SessionsCalendarMarkedDates,
};
