import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 70,
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
  backArrowContainer: {
    justifyContent: 'center',
    marginTop: 10,
    marginLeft: 10,
    padding: 10,
    position: 'absolute',
  },
  backArrow: {
    width: 25,
    height: 25,
  },
  previousDayContainer: {
    justifyContent: 'center',
    marginTop: 5,
    left: 10,
    padding: 10,
    position: 'absolute',
  },
  nextDayContainer: {
    justifyContent: 'center',
    marginTop: 5,
    right: 10,
    padding: 10,
    position: 'absolute',
    transform: [{rotate: '180deg'}]
  },
  nextDayArrow: {
    width: 25,
    height: 25,
    tintColor: "#1c73e6"
  },
  mainScreenContent: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFF99',
  },
  ///
  redButton: {
    backgroundColor: 'red',
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 70,
    height: 70,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redButtonText: {
    color: 'white',
    fontSize: 35,
    fontWeight: '900',
  },
  menuDrinkingSessionInfoText: {
    fontSize: 20,
    color: "black",
    alignSelf: "center",
    padding: 10,
  },
  menuDrinkingSessionContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuDrinkingSessionText: {
    fontSize: 16,
    color: 'black',
  },
  ///
  drinkingSessionContainer: {
    flexGrow: 1,
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 70, //offset header
  },
  // Old title
  // drinkingSessionTitle: {
  //   fontSize: 20,
  //   marginBottom: 20,
  // },
  drinkingSessionClickableTextContainer: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 15,
    width: 300,
    alignItems: 'center',
    borderColor: '#212421',
    backgroundColor: 'white',
  },
  drinkingSessionClickableTextStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212421',
  },

  drinkingSessionClickableTextInput: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 4,
    color: '#212421'
  },
  drinkingSessionButton: {
    width: 130,
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
    backgroundColor: '#007AFF'
  },
  drinkingSessionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  startSessionButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 50,
    width: 70,
    height: 70,
    backgroundColor: 'green',
    alignItems: 'center',
  },
  startSessionText: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
  },
});

export default styles;