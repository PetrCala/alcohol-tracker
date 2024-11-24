import Icon from '@components/Icon';
import useTheme from '@hooks/useTheme';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {StyleSheet, View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import ArrowIcon from '@components/DatePicker/CalendarPicker/ArrowIcon';
import CONST from '@src/CONST';
import {ValueOf} from 'type-fest';
import variables from '@src/styles/variables';

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
