import { Dimensions, StyleSheet } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  mainHeader: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    shadowColor: '#000',             
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25,             
    shadowRadius: 3.84,              
    elevation: 5,
    zIndex: 1,
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
    borderColor: '#ddd',
    elevation: 10, // for Android shadow
    // padding: 10,
  },
})

export default styles;