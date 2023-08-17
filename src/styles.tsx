import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  nextDayContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    transform: [{rotate: '180deg'}]
  },
  nextDayArrow: {
    width: 25,
    height: 25,
    tintColor: "#1c73e6"
  },
  dayOverviewFooter: {
    flexShrink: 1, // Only as large as necessary
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFF99',
    shadowColor: '#000',
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    borderRadius: 2,
    marginVertical: 0,
    borderColor: '#ddd',
    elevation: 8, // for Android shadow
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addSessionButtonContainer: {
    padding: 10,
    alignSelf: 'center',
  },
  addSessionButton: {
    borderRadius: 50,
    width: 70,
    height: 70,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center', // Center the text within the button
  },
  addSessionText: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mainScreenContent: {
    flex: 1,
    backgroundColor: '#FFFF99',
  },
  ///
  menuInSessionWarningContainer: {
    backgroundColor: '#ff5d54',
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
    alignItems: "center",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuInSessionWarningText: {
    fontSize: 22,
    color: '#ffffff', // White color for the text
    fontWeight: 'bold',
  },
  menuDrinkingSessionInfoText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 5,
    color: "black",
    alignSelf: "center",
    alignContent: "center",
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
  dayOverviewContainer: {
    flex: 1,
    overflow:"hidden"
  },
  drinkingSessionContainer: {
    flexGrow: 1,
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 90, //offset header
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
    textAlign: 'center'
  },
});

export default styles;