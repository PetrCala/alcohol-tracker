import CONST from '@src/CONST';
import type DateString from './DateString';

type DateObject = {
  dateString: DateString;
  day: number;
  month: number;
  timestamp: number;
  year: number;
};

export default DateObject;
