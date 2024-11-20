import {Dimensions, StyleSheet} from 'react-native';
import useTheme from '@hooks/useTheme';

const screenWidth = Dimensions.get('window').width;
const backArrowWidth = 60;

const commonStyles = StyleSheet.create({
  headerContainer: {
    height: 70,
    width: screenWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backArrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: backArrowWidth,
    height: '100%',
  },
  backArrow: {
    width: 25,
    height: 25,
  },
  headerRightContainer: {
    display: 'flex',
    width: screenWidth - backArrowWidth,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  mainFooter: {
    height: 54,
    width: screenWidth,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderTopWidth: 1,
    borderColor: '#ddd',
    elevation: 10, // for Android shadow
  },
  horizontalLine: {
    width: screenWidth * 0.9,
    height: 1,
    backgroundColor: 'grey',
    alignSelf: 'center',
    marginTop: 5,
  },
  linkText: {
    color: '#0000EE',
    fontWeight: '500',
  },
  smallMarginLeft: {
    marginLeft: 5,
  },
});

export default commonStyles;
