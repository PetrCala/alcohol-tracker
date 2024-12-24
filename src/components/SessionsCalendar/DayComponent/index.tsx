import {StyleSheet, TouchableOpacity, View} from 'react-native';
import type {DateData} from 'react-native-calendars';
import {hasDecimalPoint} from '@libs/DataHandling';
import type {MarkingProps} from 'react-native-calendars/src/calendar/day/marking';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {endOfDay} from 'date-fns';
import type {
  CalendarColors,
  DayComponentProps,
} from '@components/SessionsCalendar/types';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import useStyleUtils from '@hooks/useStyleUtils';

const colorToTextColorMap: Record<CalendarColors, string> = {
  yellow: 'black',
  red: 'white',
  orange: 'black',
  black: 'white',
  green: 'white',
};

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

  if (!date) {
    return null;
  }

  const getMarkingContainerStyle = (date: DateData, marking?: MarkingProps) => {
    const baseStyle = localStyles.daySessionsMarkingContainer;
    const validColors: CalendarColors[] = [
      'black',
      'yellow',
      'red',
      'orange',
      'green',
    ];

    if (state === 'disabled') {
      return {...baseStyle, borderWidth: 0};
    }

    if (endOfDay(date.timestamp).getTime() <= date.timestamp) {
      return {...baseStyle, borderWidth: 0};
    }

    const color = validColors.includes(marking?.color as CalendarColors)
      ? marking?.color
      : 'green'; // Default to 'green' if color is not in validColors

    return {...baseStyle, backgroundColor: color};
  };

  const getMarkingTextStyle = (marking?: MarkingProps) => {
    let baseStyle = localStyles.daySessionMarkingText;

    if (units) {
      units = roundToTwoDecimalPlaces(units);
    }

    if (units && hasDecimalPoint(units) && units >= 10) {
      baseStyle = {...baseStyle, fontSize: 15}; // Handle overflow
    }

    if (
      marking?.color &&
      (marking.color as CalendarColors) in colorToTextColorMap &&
      units != 0
    ) {
      return {
        ...baseStyle,
        color: colorToTextColorMap[marking.color as CalendarColors],
      };
    }

    return {...baseStyle, fontSize: 0, color: 'transparent'}; // Default case
  };

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
      {/* // TODO rewrite this using global styles */}
      <View style={getMarkingContainerStyle(date, marking)}>
        <Text style={getMarkingTextStyle(marking)}>
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
  daySessionsMarkingContainer: {
    marginTop: 0,
    marginBottom: 5,
    height: 35,
    width: 35,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 5,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  daySessionMarkingText: {
    fontSize: 18,
    alignSelf: 'center',
  },
});

export default DayComponent;
