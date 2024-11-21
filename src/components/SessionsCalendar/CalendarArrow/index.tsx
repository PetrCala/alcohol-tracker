import Icon from '@components/Icon';
import useTheme from '@hooks/useTheme';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {StyleSheet, View} from 'react-native';

type CalendarArrowProps = {
  /** The direction of the arrow */
  direction: string;
};

function CalendarArrow({direction}: CalendarArrowProps) {
  const theme = useTheme();
  const {windowWidth} = useWindowDimensions();

  return (
    <View
      style={[
        arrowStyles.customArrowContainer,
        {width: windowWidth / 3},
        direction === 'left'
          ? arrowStyles.leftContainer
          : arrowStyles.rightContainer,
      ]}>
      <Icon
        src={KirokuIcons.BackArrow}
        fill={theme.inverse}
        additionalStyles={[
          // arrowStyles.customArrowIcon,
          direction === 'left'
            ? arrowStyles.customArrowLeft
            : arrowStyles.customArrowRight,
        ]}
      />
      {/* <Text style={arrowStyles.customArrowText}>{direction === 'left' ? '<' : '>'}</Text> */}
    </View>
  );
}

const arrowStyles = StyleSheet.create({
  customArrowContainer: {
    height: 45,
    alignSelf: 'center',
    justifyContent: 'center',
    // backgroundColor: '#f2be1c',
    alignItems: 'center',
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

export default CalendarArrow;
