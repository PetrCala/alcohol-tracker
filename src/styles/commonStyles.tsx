import {Dimensions, StyleSheet} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const backArrowWidth = 60;

const commonStyles = StyleSheet.create({
  headerContainer: {
    height: 70,
    width: screenWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
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
  mainFooter: {
    height: 55,
    width: screenWidth,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#ddd',
    elevation: 10, // for Android shadow
    // padding: 10,
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
