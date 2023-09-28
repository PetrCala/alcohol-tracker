import React, {
    useEffect,
    useState,
    useContext,
    useRef,
} from 'react';
import {
  Alert,
  Image,
  ImageSourcePropType,
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
import { addUnits, formatDateToDay, formatDateToTime, removeUnits, removeZeroObjectsFromSession, sumAllUnits, sumUnitsOfSingleType, timestampToDate, unitsToColors } from '../utils/dataHandling';
import { getAuth } from 'firebase/auth';
import DrinkingSessionUnitWindow from '../components/DrinkingSessionUnitWindow';
import { maxAllowedUnits } from '../utils/static';
import YesNoPopup from '../components/Popups/YesNoPopup';
import { useUserConnection } from '../context/UserConnectionContext';
import UserOffline from '../components/UserOffline';
import { DrinkDataProps, UnitTypesViewProps } from '../types/components';
import UnitTypesView from '../components/UnitTypesView';
import SessionDetailsSlider from '../components/SessionDetailsSlider';

const EditSessionScreen = ({ route, navigation}: EditSessionScreenProps) => {
    if (!route || ! navigation) return null; // Should never be null
    const { session, sessionKey, preferences } = route.params; 
    const auth = getAuth();
    const user = auth.currentUser;
    const { isOnline } = useUserConnection();
    // Units
    const [currentUnits, setCurrentUnits] = useState<UnitsObject>(session.units);
    const [totalUnits, setTotalUnits] = useState<number>(sumAllUnits(currentUnits));
    const [availableUnits, setAvailableUnits] = useState<number>(maxAllowedUnits - totalUnits);
    // Hooks for immediate display info - update these manually to improve efficiency
    const [beerSum, setBeerSum] = useState<number>(sumUnitsOfSingleType(currentUnits, 'beer'));
    const [cocktailSum, setCocktailSum] = useState<number>(sumUnitsOfSingleType(currentUnits, 'cocktail'));
    const [otherSum, setOtherSum] = useState<number>(sumUnitsOfSingleType(currentUnits, 'other'));
    const [strongShotSum, setStrongShotSum] = useState<number>(sumUnitsOfSingleType(currentUnits, 'strong_shot'));
    const [weakShotSum, setWeakShotSum] = useState<number>(sumUnitsOfSingleType(currentUnits, 'weak_shot'));
    const [wineSum, setWineSum] = useState<number>(sumUnitsOfSingleType(currentUnits, 'wine'));
    // Session details
    const [isBlackout, setIsBlackout] = useState<boolean>(session.blackout);
    const [note, setNote] = useState<string>(session.note);
    // Time info
    const sessionDate = timestampToDate(session.start_time);
    const sessionDay = formatDateToDay(sessionDate);
    const sessionStartTime = formatDateToTime(sessionDate);
    const db = useContext(DatabaseContext);
      // Other
    const [monkeMode, setMonkeMode] = useState<boolean>(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
    const sessionColor = unitsToColors(totalUnits, preferences.units_to_colors);
    const scrollViewRef = useRef<ScrollView>(null); // To navigate the view
    const sessionIsNew = sessionKey == 'edit-session-id' ? true : false;

    // Automatically navigate to login screen if login expires
    if (user == null){
        navigation.replace("Login Screen");
        return null;
    }

    const drinkData: DrinkDataProps = [
      { key: 'beer', icon: require('../assets/icons/beer.png'), typeSum: beerSum, setTypeSum: setBeerSum},
      { key: 'wine', icon: require('../assets/icons/wine.png'), typeSum: wineSum, setTypeSum: setWineSum},
      { key: 'weak_shot', icon: require('../assets/icons/weak_shot.png'), typeSum: weakShotSum, setTypeSum: setWeakShotSum},
      { key: 'strong_shot', icon: require('../assets/icons/strong_shot.png'), typeSum: strongShotSum, setTypeSum: setStrongShotSum},
      { key: 'cocktail', icon: require('../assets/icons/cocktail.png'), typeSum: cocktailSum, setTypeSum: setCocktailSum},
      { key: 'other', icon: require('../assets/icons/alcohol_assortment.png'), typeSum: otherSum, setTypeSum: setOtherSum},
    ];

    const handleMonkePlus = () => {
      if (availableUnits > 0) {
        let unitsToAdd:UnitTypesProps = {other: 1};
        let newUnits: UnitsObject = addUnits(currentUnits, unitsToAdd);
        setCurrentUnits(newUnits);
        setOtherSum(otherSum + 1);
      };
    };
  
    const handleMonkeMinus = () => {
      if (otherSum > 0) {
        let newUnits: UnitsObject = removeUnits(currentUnits, "other", 1);
        setCurrentUnits(newUnits);
        setOtherSum(otherSum - 1);
      };
      // Here, as else, maybe send an alert that there are other types of
      // units logged
    };

    const handleBlackoutChange = (value: boolean) => {
      setIsBlackout(value);
    };
  
    const handleNoteChange = (value: string) => {
      setNote(value);
    };

    // Update the hooks whenever current units change
    useEffect(() => {
      let newTotalUnits = sumAllUnits(currentUnits);
      let newAvailableUnits = maxAllowedUnits - newTotalUnits;
      setTotalUnits(newTotalUnits);
      setAvailableUnits(newAvailableUnits);
    }, [currentUnits]);


    async function saveSession(db: any, userId: string) {
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
          units: currentUnits,
          blackout: isBlackout,
          note: note,
          ongoing: null,
        };
        newSessionData = removeZeroObjectsFromSession(newSessionData); // Delete the initial log of zero units that was used as a placeholder
        try {
          await editDrinkingSessionData(db, userId, newSessionData, sessionKey, sessionIsNew); // Finish editing
        } catch (error:any) {
          throw new Error('Failed to edit the drinking session data: ' + error.message);
        };
        navigation.goBack();
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
      navigation.goBack();
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
            Session date: {sessionDay}
        </Text>
      </View>
      <View style={styles.unitCountContainer}>
          <Text style={[ styles.unitCountText,
            {color: sessionColor}
          ]}>
            {totalUnits}
          </Text>
      </View>
      <ScrollView 
      style={styles.scrollView} 
      ref={scrollViewRef}
      keyboardShouldPersistTaps="handled"
    >
    {monkeMode ?
    <View style={styles.modifyUnitsContainer}>
      <TouchableOpacity
          style={[styles.modifyUnitsButton, {backgroundColor: 'red'}]}
          onPress={() => handleMonkeMinus()}
      >
        <Text style={styles.modifyUnitsText}>-</Text>
      </TouchableOpacity>
      <TouchableOpacity
          style={[styles.modifyUnitsButton, {backgroundColor: 'green'}]}
          onPress={() => handleMonkePlus()}
      >
        <Text style={styles.modifyUnitsText}>+</Text>
      </TouchableOpacity>
    </View>
    :
    <>
    <View style={styles.unitTypesContainer}>
      <UnitTypesView 
        drinkData={drinkData}
        currentUnits={currentUnits}
        setCurrentUnits={setCurrentUnits}
        availableUnits={availableUnits}
      />
    </View>
    <SessionDetailsSlider 
      scrollViewRef={scrollViewRef}
      isBlackout={isBlackout}
      onBlackoutChange={handleBlackoutChange}
      note={note}
      onNoteChange={handleNoteChange}
    />
    </>
    }
    </ScrollView>
    <View style={styles.saveSessionDelimiter}/>
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
          onPress={() => saveSession(db, user.uid)}
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
    height: '19%',
    backgroundColor: '#FFFF99',
    borderBottomColor: '#000',
    borderBottomWidth: 1,
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
    flex: 1,
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
  saveSessionDelimiter: {
    height: 5,
    width: '100%',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#000',
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
    borderColor: '#000',
  },
  saveSessionButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});