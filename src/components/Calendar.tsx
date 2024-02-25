import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {
  getPreviousMonth,
  getNextMonth,
  changeDateBySomeDays,
  getTimestampAtMidnight,
  aggregateSessionsByDays,
  monthEntriesToColors,
  hasDecimalPoint,
} from '@libs/DataHandling';
import * as KirokuIcons from '@src/components/Icon/KirokuIcons';
import {DateObject} from '@src/types/time';
import LoadingData from './LoadingData';
import CONST from '@src/CONST';
import {
  DrinkingSessionArray,
  DrinkingSessionList,
  Preferences,
} from '@src/types/database';

type DayMarking = {
  units?: number;
  color?: CalendarColors;
  textColor?: string;
};

type CalendarColors = 'yellow' | 'red' | 'orange' | 'black' | 'green';

type DayState = 'selected' | 'disabled' | 'today' | '';

type SessionsCalendarProps = {
  drinkingSessionData: DrinkingSessionList | null;
  preferences: Preferences;
  visibleDateObject: DateObject;
  dispatch: React.Dispatch<any>;
  // setVisibleDateObject: React.Dispatch<React.SetStateAction<DateObject>>;
  onDayPress: (day: any) => void;
};

type SessionsCalendarMarkedDates = {
  [date: string]: DayMarking;
};

type SessionsCalendarDatesType = {
  [key: string]: {
    units: number;
    blackout: boolean;
  };
};

const colorToTextColorMap: Record<CalendarColors, string> = {
  yellow: 'black',
  red: 'white',
  orange: 'black',
  black: 'white',
  green: 'white',
};

// Custom Day Component
const DayComponent: React.FC<{
  date: DateObject;
  state: DayState;
  marking: DayMarking;
  theme: any;
  onPress: (day: DateObject) => void;
}> = ({date, state, marking, theme, onPress}) => {
  // Calculate the date information with memos to avoid recalculation
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => changeDateBySomeDays(today, 1), [today]);
  const tomorrowMidnight = useMemo(
    () => getTimestampAtMidnight(tomorrow),
    [tomorrow],
  );

  const dateNoLaterThanToday = useCallback(
    (date: DateObject): boolean => {
      return date.timestamp < tomorrowMidnight;
    },
    [tomorrowMidnight],
  );

  const getTextStyle = (state: DayState) => {
    let textStyle = styles.dayText;
    if (state === 'disabled') {
      textStyle = {...textStyle, ...styles.dayTextDisabled};
    } else if (state === 'today') {
      textStyle = {...textStyle, ...styles.dayTextToday};
    }
    return textStyle;
  };

  const getMarkingContainerStyle = (date: DateObject, marking: DayMarking) => {
    let baseStyle = styles.daySessionsMarkingContainer;

    if (state === 'disabled') {
      return {...baseStyle, borderWidth: 0};
    }

    const colors = ['black', 'yellow', 'red', 'orange'];
    if (!dateNoLaterThanToday(date)) {
      return {...baseStyle, borderWidth: 0};
    } else if (!marking?.color) {
      return {...baseStyle, backgroundColor: 'green'};
    } else if (colors.includes(marking?.color)) {
      return {...baseStyle, backgroundColor: marking?.color};
    } else {
      return {...baseStyle, backgroundColor: 'green'};
    }
  };

  const getMarkingTextStyle = (marking: DayMarking) => {
    let baseStyle = styles.daySessionMarkingText;

    if (
      marking?.units &&
      hasDecimalPoint(marking.units) &&
      marking.units >= 10
    ) {
      baseStyle = {...baseStyle, fontSize: 15}; // Handle overflow
    }

    if (
      marking?.color &&
      colorToTextColorMap[marking?.color] &&
      marking?.units != 0
    ) {
      return {...baseStyle, color: colorToTextColorMap[marking?.color]};
    }

    return {...baseStyle, fontSize: 0, color: 'transparent'}; // Default case
  };

  return (
    <TouchableOpacity style={styles.dayContainer} onPress={() => onPress(date)}>
      <Text style={getTextStyle(state)}>{date.day}</Text>
      <View style={getMarkingContainerStyle(date, marking)}>
        <Text style={getMarkingTextStyle(marking)}>
          {state === 'disabled' ? '' : marking?.units}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

function CustomArrow(direction: string): ReactNode {
  return (
    <View
      style={[
        arrowStyles.customArrowContainer,
        direction === 'left'
          ? arrowStyles.leftContainer
          : arrowStyles.rightContainer,
      ]}>
      <Image
        source={KirokuIcons.ArrowBack}
        style={[
          arrowStyles.customArrowIcon,
          direction === 'left'
            ? arrowStyles.customArrowLeft
            : arrowStyles.customArrowRight,
        ]}
      />
      {/* <Text style={arrowStyles.customArrowText}>{direction === 'left' ? '<' : '>'}</Text> */}
    </View>
  );
}

const SessionsCalendar: React.FC<SessionsCalendarProps> = ({
  drinkingSessionData,
  preferences,
  visibleDateObject,
  dispatch,
  onDayPress,
}) => {
  const [calendarData, setCalendarData] = useState<DrinkingSessionArray>(
    drinkingSessionData ? Object.values(drinkingSessionData) : [],
  );
  const [markedDates, setMarkedDates] = useState<SessionsCalendarMarkedDates>(
    {},
  );
  const [loadingMarkedDates, setLoadingMarkedDays] = useState<boolean>(true);

  const getMarkedDates = (
    calendarData: DrinkingSessionArray,
    preferences: Preferences,
  ): SessionsCalendarMarkedDates => {
    // Use points to calculate the point sum (flagged as units)
    var aggergatedSessions = aggregateSessionsByDays(
      calendarData,
      'points',
      preferences.units_to_points,
    );
    var newMarkedDates = monthEntriesToColors(aggergatedSessions, preferences);
    return newMarkedDates;
  };

  /** Handler for the left arrow calendar press. Uses a callback to
   * move to the previous month
   *
   * @param subtractMonth A callback to move the months
   */
  const handleLeftArrowPress = (subtractMonth: () => void) => {
    const previousMonth = getPreviousMonth(visibleDateObject);
    dispatch({type: 'SET_VISIBLE_DATE_OBJECT', payload: previousMonth});
    subtractMonth(); // Use the callback to move to the previous month
  };

  /** Handler for the left arrow calendar press. Uses a callback to
   * move to the following month
   *
   * @param addMonth A callback to move the months
   */
  const handleRightArrowPress = (addMonth: () => void) => {
    const nextMonth = getNextMonth(visibleDateObject);
    dispatch({type: 'SET_VISIBLE_DATE_OBJECT', payload: nextMonth});
    addMonth(); // Use the callback to move to the next month
  };

  // Monitor the local calendarData hook that depends on the drinking session data
  useEffect(() => {
    const newData = drinkingSessionData
      ? Object.values(drinkingSessionData)
      : [];
    setCalendarData(newData);
  }, [drinkingSessionData]);

  // Monitor marked days
  useEffect(() => {
    let newMarkedDates = getMarkedDates(calendarData, preferences);
    setMarkedDates(newMarkedDates);
    setLoadingMarkedDays(false);
  }, [calendarData, preferences]);

  if (loadingMarkedDates) return <LoadingData />;

  return (
    <Calendar
      current={visibleDateObject.dateString}
      dayComponent={({date, state, marking, theme}) => (
        <DayComponent
          date={date as DateObject}
          state={state as DayState}
          marking={marking as any}
          theme={theme as any}
          onPress={onDayPress}
        />
      )}
      monthFormat="MMM yyyy"
      onPressArrowLeft={subtractMonth => handleLeftArrowPress(subtractMonth)}
      onPressArrowRight={addMonth => handleRightArrowPress(addMonth)}
      markedDates={markedDates}
      markingType={'period'}
      firstDay={preferences.first_day_of_week === 'Monday' ? 1 : 0}
      enableSwipeMonths={false}
      disableAllTouchEventsForDisabledDays={true}
      renderArrow={CustomArrow}
      style={styles.mainScreenCalendarStyle}
      theme={
        {
          textDayHeaderFontWeight: 'bold',
          'stylesheet.calendar.header': {
            header: {
              width: screenWidth,
              marginLeft: -5,
              flexDirection: 'row',
              alignItems: 'center',
              margin: 0,
              padding: 0,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: 'grey',
            },
            monthText: {
              color: 'black',
              fontSize: 20,
              fontWeight: '500',
              width: screenWidth / 3,
              textAlign: 'center',
            },
          },
        } as any
      } // Circumvent typescript gymnastics
    />
  );
};

const screenWidth = Dimensions.get('window').width;

const arrowStyles = StyleSheet.create({
  customArrowContainer: {
    height: 45,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
    width: screenWidth / 3,
    marginVertical: -10,
  },
  leftContainer: {
    marginRight: -10,
    marginLeft: -10,
  },
  rightContainer: {
    marginLeft: -10,
  },
  customArrowIcon: {
    height: 20,
    width: 20,
  },
  customArrowLeft: {
    alignSelf: 'flex-start',
    marginLeft: 15,
  },
  customArrowRight: {
    alignSelf: 'flex-end',
    marginRight: 15,
    transform: [{rotate: '180deg'}],
  },
});

const styles = StyleSheet.create({
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
    color: 'black',
    alignSelf: 'flex-start',
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
  // Calendar styles
  mainScreenCalendarStyle: {
    width: '100%',
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#000',
    flexGrow: 1,
    flexShrink: 1,
  },
});

export default SessionsCalendar;
export type {
  DayMarking,
  CalendarColors,
  DayState,
  SessionsCalendarDatesType,
  SessionsCalendarMarkedDates,
};
