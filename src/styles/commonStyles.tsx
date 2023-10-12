import { StyleSheet } from 'react-native';

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
})

export default styles;