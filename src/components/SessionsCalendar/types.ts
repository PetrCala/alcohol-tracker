import {DrinkingSessionList, Preferences} from '@src/types/onyx';
import type {DayMarking, DayComponentProps} from './DayComponent/types';
import {UserID} from '@src/types/onyx/OnyxCommon';

type CalendarColors = 'yellow' | 'red' | 'orange' | 'black' | 'green';

// type DayState = 'selected' | 'disabled' | 'today' | ''; // Old day state

type SessionsCalendarProps = {
  /** ID of the user for which to render the calendar */
  userID: UserID;

  /** The drinking session to render */
  drinkingSessionData: DrinkingSessionList;

  /** User's preferences */
  preferences: Preferences;

  /** Callback for when the date changes */
  onDateChange?: (date: Date) => void;
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

const colorToTextColorMap: Record<CalendarColors, string> = {
  yellow: 'black',
  red: 'white',
  orange: 'black',
  black: 'white',
  green: 'white',
};

export default SessionsCalendarProps;
export type {
  DayMarking,
  DayComponentProps,
  CalendarColors,
  SessionsCalendarDatesType,
  SessionsCalendarMarkedDates,
};
