import Text from '@components/Text';
import {useCallback, useMemo} from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import {CalendarColors, DayComponentProps, DayMarking} from '../types';
import {DateData} from 'react-native-calendars';
import {
  changeDateBySomeDays,
  getTimestampAtMidnight,
  hasDecimalPoint,
} from '@libs/DataHandling';
import {DayState} from 'react-native-calendars/src/types';
import {MarkingProps} from 'react-native-calendars/src/calendar/day/marking';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';

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
  marking,
  theme,
  onPress,
}: DayComponentProps) {
  if (!date) {
    return null;
  }
  // Calculate the date information with memos to avoid recalculation
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => changeDateBySomeDays(today, 1), [today]);
  const tomorrowMidnight = useMemo(
    () => getTimestampAtMidnight(tomorrow),
    [tomorrow],
  );

  const dateNoLaterThanToday = useCallback(
    (date: DateData): boolean => {
      return date.timestamp < tomorrowMidnight;
    },
    [tomorrowMidnight],
  );

  const getTextStyle = (state: DayState | undefined): StyleProp<TextStyle> => {
    let textStyle = localStyles.dayText;
    if (state === 'disabled') {
      textStyle = {...textStyle, ...localStyles.dayTextDisabled};
    } else if (state === 'today') {
      textStyle = {...textStyle, ...localStyles.dayTextToday};
    } else {
      textStyle = {...textStyle, ...{color: theme?.textDayColor || 'black'}};
    }
    return textStyle;
  };

  const getMarkingContainerStyle = (
    date: DateData,
    marking?: DayMarking | MarkingProps,
  ) => {
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

    if (!dateNoLaterThanToday(date)) {
      return {...baseStyle, borderWidth: 0};
    }

    const color = validColors.includes(marking?.color as CalendarColors)
      ? marking?.color
      : 'green'; // Default to 'green' if color is not in validColors

    return {...baseStyle, backgroundColor: color};
  };

  const getMarkingTextStyle = (marking?: DayMarking) => {
    let baseStyle = localStyles.daySessionMarkingText;

    // Ensure no funky numbers
    if (marking?.units) {
      marking.units = roundToTwoDecimalPlaces(marking.units);
    }

    if (
      marking?.units &&
      hasDecimalPoint(marking.units) &&
      marking.units >= 10
    ) {
      baseStyle = {...baseStyle, fontSize: 15}; // Handle overflow
    }

    if (
      marking?.color &&
      (marking.color as CalendarColors) in colorToTextColorMap &&
      marking.units != 0
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
      <Text style={getTextStyle(state)}>{date?.day}</Text>
      <View style={getMarkingContainerStyle(date, marking)}>
        <Text style={getMarkingTextStyle(marking)}>
          {state === 'disabled' ? '' : marking?.units}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  // Day component styles
  dayContainer: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: '#E0E0E0',
    width: '100%', // Give explicit width and height
    height: 50,
    // borderRadius: 4, // Rounded corners
  },
  dayText: {
    marginTop: 1,
    marginLeft: 2,
    fontSize: 10,
    alignSelf: 'flex-start',
    color: 'black' as string, // allow overrides
  },
  dayTextDisabled: {
    color: '#D3D3D3',
  },
  dayTextToday: {
    color: 'blue', // Blue text for the current day
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
