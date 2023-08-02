import React, {
  useState,
  useContext
} from 'react';
import {
  Text,
  View,
} from 'react-native';
import styles from '../styles';
import MenuIcon from '../components/Buttons/MenuIcon';
import BasicButton from '../components/Buttons/BasicButton';

import DatabaseContext from '../DatabaseContext';
import { saveDrinkingSessionData } from '../database';
import ClickableTextInput from '../components/Buttons/ClickableTextInput';

type DrinkingSessionProps = {
  navigation: any;
}

const DrinkingSessionScreen = (props: DrinkingSessionProps) => {
  const { navigation } = props;
  const db = useContext(DatabaseContext);
  const userId = 'petr_cala';
  const [units, setUnits] = useState(0);

  const addUnit = () => {
    setUnits(units + 1);
  };

  const removeUnit = () => {
    if (units > 0) {
      setUnits(units - 1);
    }
  }

  async function saveSession(db: any, userId: string, units: number) {
    // Save the data into the database
    try {
      await saveDrinkingSessionData(db, userId, units); // Save drinking session data
    } catch (error:any) {
      throw new Error('Failed to save drinking session data: ' + error.message);
    }
    // Show statistics, offer to go back
    setUnits(0);
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
          onPress={() => navigation.goBack() }
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
          onPress={addUnit}
        />
        <BasicButton 
          text='Remove Unit'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={removeUnit}
        />
        <BasicButton 
          text='Save Session'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={() => saveSession(db, userId, units)}
        />
        <BasicButton 
          text='Discard Session'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={() => navigation.goBack()}
        />
      </View>
    </View>
  );
};

export default DrinkingSessionScreen;
