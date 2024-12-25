import type {DayState, DateData, Theme} from 'react-native-calendars/src/types';
import type {MarkingProps} from 'react-native-calendars/src/calendar/day/marking';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type CONST from '@src/CONST';

/** A list of calendar colors that are light and should display a dark text on them */
type LightCalendarColors = DeepValueOf<typeof CONST.CALENDAR_COLORS.LIGHT>;

/** A list of calendar colors that are dark and should display a light text on them */
type DarkCalendarColors = DeepValueOf<typeof CONST.CALENDAR_COLORS.DARK>;

/** A list of all calendar colors */
type CalendarColors = LightCalendarColors | DarkCalendarColors;

/** Props for a react native calendar day component */
type DayComponentProps = {
  date: DateData;
  state?: DayState;
  units?: number;
  marking?: MarkingProps;
  theme?: Theme;
  onPress?: (day: DateData) => void;
};

export type {
  DayComponentProps,
  CalendarColors,
  LightCalendarColors,
  DarkCalendarColors,
};
