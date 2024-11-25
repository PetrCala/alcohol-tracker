import type {DayState, DateData, Theme} from 'react-native-calendars/src/types';
import {MarkingProps} from 'react-native-calendars/src/calendar/day/marking';

type CalendarColors = 'yellow' | 'red' | 'orange' | 'black' | 'green';

type DayComponentProps = {
  date?: DateData;
  state?: DayState;
  units?: number;
  marking?: MarkingProps;
  theme?: Theme;
  onPress?: (day: DateData) => void;
};

export type {DayComponentProps, CalendarColors};
