import React, {useState} from 'react';
import {
  Text,
  View,
} from 'react-native';
import styles from '../styles';
import MenuIcon from '../components/Buttons/MenuIcon';
import BasicButton from '../components/Buttons/BasicButton';
import SQLite from 'react-native-sqlite-storage';

type DrinkingSessionProps = {
  navigation: any;
}

const DrinkingSessionScreen = (props: DrinkingSessionProps) => {
  const { navigation } = props;

  const [units, setUnits] = useState(0);

  const addUnit = () => {
    setUnits(units + 1);
  };

  const endSession = () => {
    // endSession, show statistics, offer to go back
    saveSession();
    setUnits(0);
    navigation.goBack();
  };

  const saveSession = () => {
    // Save the session data to an SQLite database, using a custom key
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
        <Text style={styles.drinkingSessionTitle}>
          Consumed: {units}{" "}
          {units != 1 ? "units" : "unit"}
        </Text>
        <BasicButton 
          text='Add Unit'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={addUnit}
        />
        <BasicButton 
          text='End Session'
          buttonStyle={styles.drinkingSessionButton}
          textStyle={styles.drinkingSessionButtonText}
          onPress={endSession}
        />
      </View>
    </View>
  );
};

export default DrinkingSessionScreen;
