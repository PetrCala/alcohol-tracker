import type {DayState, DateData} from 'react-native-calendars/src/types';

type DayMarking = {
  units?: number;
  color?: string;
  textColor?: string;
};

type DayComponentProps = {
  date?: DateData;
  state?: DayState;
  marking?: DayMarking;
  theme?: any;
  onPress?: (day: DateData) => void;
};

export type {DayMarking, DayComponentProps};
