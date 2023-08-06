import React, {
  useRef,
  useState,
  useContext,
  useEffect
} from 'react';
import {
  Text,
  View,
} from 'react-native';
import styles from '../styles';
import MenuIcon from '../components/Buttons/MenuIcon';
import BasicButton from '../components/Buttons/BasicButton';
import { DrinkingSessionScreenProps } from '../utils/types';
import DatabaseContext from '../DatabaseContext';
import { saveDrinkingSessionData, updateCurrentUnits, discardDrinkingSessionData } from '../database';
import ClickableTextInput from '../components/Buttons/ClickableTextInput';


const DrinkingSessionScreen = ({ route, navigation}: DrinkingSessionScreenProps) => {
  const { current_units, timestamp } = route.params;
  const [units, setUnits] = useState(current_units);
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const db = useContext(DatabaseContext);
  const updateTimeout = 1000; // Synchronize with DB every x milliseconds
  const userId = 'petr_cala';


  // Change local hook value
  const changeUnits = (number: number) => {
    console.log(timestamp);
    const newUnits = units + number;
    if (newUnits >= 0){
      setUnits(newUnits);
    }
  };

  // Create a ref to store the previous state
  const prevUnitsRef = useRef<number>();
    useEffect(() => {
      prevUnitsRef.current = units;
    });
  const prevUnits = prevUnitsRef.current;

  // Change database value once every second
  useEffect(() => {
    // Only schedule a database update if the units have changed
    if (prevUnits !== units) {
      setPendingUpdate(true);
      const timer = setTimeout(async () => {
        await updateCurrentUnits(db, userId, units);
        setPendingUpdate(false); // Data has been synchronized with DB
      }, updateTimeout); // Update every x milliseconds
      // Clear timer on unmount or when units changes
      return () => clearTimeout(timer);
    }
  }, [units]);


  async function saveSession(db: any, userId: string, units: number, timestamp: number) {
    // Save the data into the database
    if (units > 0){
      try {
        await saveDrinkingSessionData(db, userId, units, timestamp); // Save drinking session data
      } catch (error:any) {
        throw new Error('Failed to save drinking session data: ' + error.message);
      }
      // Show statistics, offer to go back
      setUnits(0);
      navigation.goBack();
    }
  };

  /** Discard the current session, reset current units and 
   * session status, and navigate to main menu.
   */
  async function discardSession(db: any, userId: string){
    try {
      await discardDrinkingSessionData(db, userId); 
    } catch (error:any) {
      throw new Error('Failed to discard the session: ' + error.message);
    }
    setUnits(0);
    navigation.goBack();
  }

  /** If an update is pending, update immediately before navigating away
   */
  const handleBackPress = async () => {
    if (pendingUpdate) {
      await updateCurrentUnits(db, userId, units);
    }
    navigation.goBack();
  };

  return (
    <View style={{flex:1, backgroundColor: '#FFFF99'}}>
      <View style={styles.header}>
        <MenuIcon
          iconId='escape-drinking-session'
          iconSource={require('../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={handleBackPress}
        />
      </View>
      <View style={styles.drinkingSessionContainer}>
        <ClickableTextInput
          text = ''
          currentUnits={units}
          onUnitsChange={setUnits}
        />
        <BasicButton 
          text='Add Unit'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={() => changeUnits(1)}
        />
        <BasicButton 
          text='Remove Unit'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={() => changeUnits(-1)}
        />
        <BasicButton 
          text='Save Session'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={() => saveSession(db, userId, units, timestamp)}
        />
        <BasicButton 
          text='Discard Session'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={() => discardSession(db, userId)}
        />
      </View>
    </View>
  );
};

export default DrinkingSessionScreen;
