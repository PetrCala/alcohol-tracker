import {StyleSheet} from 'react-native';

const headerStyles = StyleSheet.create({
  grayHeaderContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'gray',
  },
  grayHeaderText: {
    fontSize: 15,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default headerStyles;
