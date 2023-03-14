import React, {useState} from 'react';
import {
  Button,
  Text,
  View,
} from 'react-native';
import styles from '../styles';


const DrinkingSession = () => {
  const [units, setUnits] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);

  const startSession = () => {
    setSessionStarted(true);
  };

  const addUnit = () => {
    setUnits(units + 1);
  };

  const endSession = () => {
    setSessionStarted(false);
    saveSession();
    setUnits(0);
  };

  const saveSession = () => {
    // Save the session data to a calendar, using the current date as the key
    // Code to save the session data goes here
  };

  return (
    <View style={styles.drinkingSessionContainer}>
      {!sessionStarted ? (
        <>
          <Text style={styles.drinkingSessionTitle}>Start a new drinking session</Text>
          <Button title="Start Session" onPress={startSession} />
        </>
      ) : (
        <>
          <Text style={styles.drinkingSessionTitle}>
            Units consumed: {units}{" "}
            {units > 1 ? "units" : "unit"}
          </Text>
          <Button title="Add Unit" onPress={addUnit} />
          <Button title="End Session" onPress={endSession} />
        </>
      )}
    </View>
  );
};


export default DrinkingSession;
