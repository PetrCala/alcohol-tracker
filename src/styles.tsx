import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drinkingSessionTimeInfo: {
    fontSize: 24,
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center' as 'center', 
    color: '#212421',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
});

export default styles;