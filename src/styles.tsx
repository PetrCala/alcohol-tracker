import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
  },
  profileIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    flex: 1,
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  headerUsernameContainer: {
    //Ensure the container fills all space between, no more, no less
    flexGrow: 1,
    flexShrink: 1,
    //other
    justifyContent: 'center',
    paddingLeft: 10,
  },
  headerUsername: {
    flexWrap: 'wrap',
    fontSize: 18,
    fontWeight: '500',
    color: 'black',
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: 150,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: 25,
    height: 25,
    padding: 10,
  },
  mainScreenContent: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFF99',
  },
  drinkingSessionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  drinkingSessionTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  startSessionButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  startSessionButton: {
    backgroundColor: 'green',
    borderRadius: 50,
    width: 70,
    height: 70,
    alignItems: 'center',
  },
  startSessionText: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
  },
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//     padding: 10,
//   },
});

export default styles;