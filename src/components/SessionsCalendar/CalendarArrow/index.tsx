import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import ArrowIcon from '@components/DatePicker/CalendarPicker/ArrowIcon';
import type CONST from '@src/CONST';
import type {ValueOf} from 'type-fest';

/** Direction of the calendar arrow */
type Direction = ValueOf<typeof CONST.DIRECTION>;

function CalendarArrow(direction: Direction) {
  const styles = useThemeStyles();
  return (
    <View style={styles.sessionsCalendarArrow(direction)}>
      <ArrowIcon direction={direction} />
    </View>
  );
}

export default CalendarArrow;
export type {Direction};
