// This module is outdated at will be depcrecated/deleted in the future

import {Dimensions, StyleSheet} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const backArrowWidth = 60;

const commonStyles = StyleSheet.create({
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
