import React, {
    useEffect,
    useState,
    useContext,
} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import BasicButton from '../components/Buttons/BasicButton';
import { EditSessionScreenProps} from '../types/screens';
import { DrinkingSessionArrayItem, DrinkingSessionData, UnitTypesKeys, UnitTypesProps, UnitsObject } from '../types/database';
import DatabaseContext from '../context/DatabaseContext';
import { removeDrinkingSessionData, editDrinkingSessionData } from '../database/drinkingSessions';
import SessionUnitsInputWindow from '../components/Buttons/SessionUnitsInputWindow';
import { addUnits, formatDateToDay, formatDateToTime, removeUnits, sumAllUnits, sumUnitsOfSingleType, timestampToDate, unitsToColors } from '../utils/dataHandling';
import { getAuth } from 'firebase/auth';
import DrinkingSessionUnitWindow from '../components/DrinkingSessionUnitWindow';
import { maxAllowedUnits } from '../utils/static';
import YesNoPopup from '../components/Popups/YesNoPopup';
import { useUserConnection } from '../context/UserConnectionContext';
import UserOffline from '../components/UserOffline';


const EditSessionScreen = ({ route, navigation}: EditSessionScreenProps) => {
    if (!route || ! navigation) return null; // Should never be null
    const { session, sessionKey, preferences } = route.params; 
    const auth = getAuth();
    const user = auth.currentUser;
    const { isOnline } = useUserConnection();
    // Hooks
    const [thisSession, setThisSession] = useState<DrinkingSessionArrayItem>(session);
    const [currentUnits, setCurrentUnits] = useState<UnitsObject>(thisSession.units);
    // Units
    const [totalUnits, setTotalUnits] = useState<number>(sumAllUnits(currentUnits));
    const [availableUnits, setAvailableUnits] = useState<number>(maxAllowedUnits - totalUnits);
    const [beerUnits, setBeerUnits] = useState(sumUnitsOfSingleType(currentUnits, 'beer'));
    const [cocktailUnits, setCocktailUnits] = useState(sumUnitsOfSingleType(currentUnits, 'cocktail'));
    const [otherUnits, setOtherUnits] = useState(sumUnitsOfSingleType(currentUnits, 'other'));
    const [strongShotUnits, setStrongShotUnits] = useState(sumUnitsOfSingleType(currentUnits, 'strong_shot'));
    const [weakShotUnits, setWeakShotUnits] = useState(sumUnitsOfSingleType(currentUnits, 'weak_shot'));
    const [wineUnits, setWineUnits] = useState(sumUnitsOfSingleType(currentUnits, 'wine'));
    const allUnits:UnitTypesProps = {
      beer: beerUnits,
      cocktail: cocktailUnits,
      other: otherUnits,
      strong_shot: strongShotUnits,
      weak_shot: weakShotUnits,
      wine: wineUnits,
    };
    // Time info
    const sessionDate = timestampToDate(session.start_time);
    const sessionDay = formatDateToDay(sessionDate);
    const sessionStartTime = formatDateToTime(sessionDate);
    const db = useContext(DatabaseContext);
      // Other
    const [monkeMode, setMonkeMode] = useState<boolean>(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
    const sessionColor = unitsToColors(totalUnits, preferences.units_to_colors);
    const sessionIsNew = sessionKey == 'edit-session-id' ? true : false;


    // Automatically navigate to login screen if login expires
    if (user == null){
        navigation.replace("Login Screen");
        return null;
    }

    // Update the current session whenever the units change
    useEffect(() => {
      let newSession:DrinkingSessionArrayItem = {
        ...thisSession,
        units: currentUnits
      };
      setThisSession(newSession);
    }, [currentUnits]);

    // Update the units hooks whenever the current units object changes
    useEffect(() => {
      setTotalUnits(sumAllUnits(currentUnits));
      setAvailableUnits(maxAllowedUnits - sumAllUnits(currentUnits));
      setBeerUnits(sumUnitsOfSingleType(currentUnits, 'beer'));
      setCocktailUnits(sumUnitsOfSingleType(currentUnits, 'cocktail'));
      setOtherUnits(sumUnitsOfSingleType(currentUnits, 'other'));
      setStrongShotUnits(sumUnitsOfSingleType(currentUnits, 'strong_shot'));
      setWeakShotUnits(sumUnitsOfSingleType(currentUnits, 'weak_shot'));
      setWineUnits(sumUnitsOfSingleType(currentUnits, 'wine'));
    }, [currentUnits]);

    const handleAddUnits = (units: UnitTypesProps) => {
      let newUnits: UnitsObject = addUnits(currentUnits, units);
      setCurrentUnits(newUnits);
    };
  
    const handleRemoveUnits = (unitType: typeof UnitTypesKeys[number], count: number) => {
      let newUnits: UnitsObject = removeUnits(currentUnits, unitType, count);
      setCurrentUnits(newUnits);
    };

    // Track total units
    useEffect(() => {
        let allUnitsSum = sumAllUnits(allUnits);
        setTotalUnits(allUnitsSum);
    }, [allUnits]);


    async function finishSession(db: any, userId: string) {
      if (totalUnits > 99){
          console.log('cannot save this session');
          return null;
      };
      if (!navigation){
        Alert.alert('Navigation not found', 'Failed to fetch the navigation');
        return null;
      };
      if (totalUnits > 0){
        let newSessionData: DrinkingSessionArrayItem = {
          start_time: session.start_time,
          end_time: Date.now(),
          units: allUnits,
          ongoing: null,
        };
        try {
          await editDrinkingSessionData(db, userId, newSessionData, sessionKey, sessionIsNew); // Finish editing
        } catch (error:any) {
          throw new Error('Failed to edit the drinking session data: ' + error.message);
        };
        navigation.navigate('Main Screen'); // Get the main overview, not day
      };
    };

    /** Discard the current session, reset current units and 
     * session status, and navigate to main menu.
     */
    async function deleteSession(db: any, userId: string, sessionId: string){
        try {
            await removeDrinkingSessionData(db, userId, sessionId); 
        } catch (error:any) {
            throw new Error('Failed to delete the session: ' + error.message);
        }
      }

    const handleConfirmDelete = () => {
      if (!sessionIsNew){
        deleteSession(db, user.uid, sessionKey);
      }
      setDeleteModalVisible(false);
      navigation.navigate('Main Screen'); // Get the main overview, not day
    };
  
    const handleBackPress = () => {
        navigation.goBack();
    };


    if (!isOnline) return (<UserOffline/>);

    return (
      <>
      <View style={styles.mainHeader}>
          <MenuIcon
          iconId='escape-edit-session'
          iconSource={require('../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={handleBackPress}
          />
        <BasicButton 
          text= {monkeMode ? 'Exit Monke Mode': 'Monke Mode'}
          buttonStyle={[
            styles.monkeModeButton,
            monkeMode ?  styles.monkeModeButtonEnabled : {}
          ]}
          textStyle={styles.monkeModeButtonText}
          onPress={() => setMonkeMode(!monkeMode)}
        />
      </View>
      <View style={styles.sessionInfoContainer}>
        <Text style={styles.sessionInfoText}>
            {sessionDay} {sessionStartTime}
        </Text>
      </View>
      <View style={styles.unitCountContainer}>
          <Text style={[ styles.unitCountText,
            {color: sessionColor}
          ]}>
            {totalUnits}
          </Text>
      </View>
      <ScrollView style={styles.scrollView}>
      {monkeMode ?
      <View style={styles.modifyUnitsContainer}>
        <TouchableOpacity
            style={[styles.modifyUnitsButton, {backgroundColor: 'red'}]}
            onPress={() => handleRemoveUnits("other", 1)}
        >
          <Text style={styles.modifyUnitsText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.modifyUnitsButton, {backgroundColor: 'green'}]}
            onPress={() => handleAddUnits({other: 1})}
        >
          <Text style={styles.modifyUnitsText}>+</Text>
        </TouchableOpacity>
      </View>
      :
      <View style={styles.unitTypesContainer}>
        <DrinkingSessionUnitWindow
          unitName='Beer'
          iconSource={require('../assets/icons/beer.png')}
          currentUnits={beerUnits}
          availableUnits={availableUnits}
          setCurrentUnits={setBeerUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Wine'
          iconSource={require('../assets/icons/wine.png')}
          currentUnits={wineUnits}
          availableUnits={availableUnits}
          setCurrentUnits={setWineUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Weak Shot'
          iconSource={require('../assets/icons/weak_shot.png')}
          currentUnits={weakShotUnits}
          availableUnits={availableUnits}
          setCurrentUnits={setWeakShotUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Strong Shot'
          iconSource={require('../assets/icons/strong_shot.png')}
          currentUnits={strongShotUnits}
          availableUnits={availableUnits}
          setCurrentUnits={setStrongShotUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Cocktail'
          iconSource={require('../assets/icons/cocktail.png')}
          currentUnits={cocktailUnits}
          availableUnits={availableUnits}
          setCurrentUnits={setCocktailUnits}
        />
        <DrinkingSessionUnitWindow
          unitName='Other'
          iconSource={require('../assets/icons/alcohol_assortment.png')}
          currentUnits={otherUnits}
          availableUnits={availableUnits}
          setCurrentUnits={setOtherUnits}
        />
      </View>
      }
    </ScrollView>
    <View style={styles.saveSessionContainer}>
        <BasicButton 
          text='Delete Session'
          buttonStyle={styles.saveSessionButton}
          textStyle={styles.saveSessionButtonText}
          onPress={() => setDeleteModalVisible(true)}
        />
        <YesNoPopup
          visible={deleteModalVisible}
          transparent={true}
          message={"Do you really want to\ndelete this session?"}
          onRequestClose={() => setDeleteModalVisible(false)}
          onYes={handleConfirmDelete}
        />
        <BasicButton 
          text='Save Session'
          buttonStyle={styles.saveSessionButton}
          textStyle={styles.saveSessionButtonText}
          onPress={() => finishSession(db, user.uid)}
        />
    </View>
    </>
    );
};

export default EditSessionScreen;

const styles = StyleSheet.create({
  mainHeader: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  backArrowContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 10,
  },
  backArrow: {
    width: 25,
    height: 25,
  },
  sessionInfoText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
    color: "black",
    alignSelf: "center",
    alignContent: "center",
    padding: 5,
  },
  sessionInfoContainer: {
    backgroundColor: '#FFFF99',
  },
  unitCountContainer: {
    height: '18%',
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: '#FFFF99',
    marginBottom: '-15%',
  },
  unitCountText: {
    fontSize: 90,
    fontWeight: "bold",
    // marginTop: 5,
    marginBottom: 10,
    alignSelf: "center",
    alignContent: "center",
    padding: 2,
    textShadowColor: 'black',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 9,
  },
  scrollView: {
    flexGrow:1, 
    flexShrink: 1,
    backgroundColor: '#FFFF99',
  },
  unitTypesContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: '100%',
  },
  unitsInputContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  unitsInputButton: {
    width: '40%',
    alignItems: 'center',
  },
  unitsInputText: {
    fontSize: 90,
    fontWeight: "bold",
    // marginTop: 5,
    marginBottom: 10,
    alignSelf: "center",
    alignContent: "center",
    padding: 2,
    textShadowColor: 'black',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 9,
  },
  modifyUnitsContainer: {
    height: 400,
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: "space-evenly",
    alignItems: 'center',
    flexDirection: "row",
    padding: 10,
  },
  modifyUnitsButton: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: 'center',
    borderRadius: 50,
  },
  modifyUnitsText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  monkeModeContainer: {
    height: '10%',
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#FFFF99',
  },
  monkeModeButton: {
    width: '50%',
    alignItems: "center",
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fcf50f',
  },
  monkeModeButtonEnabled: {
    backgroundColor: '#FFFF99',
  },
  monkeModeButtonText: {
    color: 'black',
    fontSize: 17,
    fontWeight: '600',
  },
  saveSessionContainer: {
    height: '8%',
    width: '100%',
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: '#FFFF99',
    marginBottom: 2,
  },
  saveSessionButton: {
    width: '50%',
    height: '100%',
    alignItems: "center",
    justifyContent: 'center',
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
    backgroundColor: '#fcf50f',
    borderWidth: 1,
    borderColor: 'grey',
  },
  saveSessionButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});