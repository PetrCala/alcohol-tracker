import {StyleSheet, TouchableOpacity, View} from 'react-native';
import type {DayComponentProps} from '@components/SessionsCalendar/types';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';

// Custom Day Component
function DayComponent({
  date,
  state,
  units,
  marking,
  theme,
  onPress,
}: DayComponentProps) {
  const StyleUtils = useStyleUtils();
  const isDisabled = state === 'disabled';
  const isToday = state === 'today';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={localStyles.dayContainer}
      onPress={() => onPress && date && onPress(date)} // Guard against undefined onPress
    >
      <Text
        style={StyleUtils.getSessionsCalendarDayLabelStyle(
          isDisabled,
          isToday,
        )}>
        {date?.day}
      </Text>
      <View
        style={StyleUtils.getSessionsCalendarDayMarkingContainerStyle(
          marking,
          isDisabled,
        )}>
        <Text
          style={StyleUtils.getSessionsCalendarDayMarkingTextStyle(marking)}>
          {isDisabled ? '' : units}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// eslint-disable-next-line @typescript-eslint/no-use-before-define
const localStyles = StyleSheet.create({
  // Day component styles
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Give explicit width and height
    height: 50,
  },
  daySessionMarkingText: {
    fontSize: 18,
    alignSelf: 'center',
  },
});

export default DayComponent;
