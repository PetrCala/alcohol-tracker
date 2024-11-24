import {DrinkingSessionList, Preferences} from '@src/types/onyx';
import type {
  DayMarking,
  DayComponentProps,
  CalendarColors,
} from './DayComponent/types';
import {UserID} from '@src/types/onyx/OnyxCommon';
import {DateData} from 'react-native-calendars';

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

type MarkingProps = {
  selected?: boolean;
  marked?: boolean;
  dotColor?: string;
  disabled?: boolean;
  color?: string; // This is the field causing the issue in your case
};

type SessionsCalendarMarkedDates = Record<string, DayMarking>;

type SessionsCalendarDatesType = Record<
  string,
  {
    units: number;
    blackout?: boolean;
  }
>;

export default SessionsCalendarProps;
export type {
  DayMarking,
  DayComponentProps,
  CalendarColors,
  SessionsCalendarDatesType,
  SessionsCalendarMarkedDates,
};
