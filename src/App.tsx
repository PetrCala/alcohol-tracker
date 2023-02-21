/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';


const AlcoholTracker = () => {
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
    <View style={styles.container}>
      {!sessionStarted ? (
        <>
          <Text style={styles.title}>Start a new drinking session</Text>
          <Button title="Start Session" onPress={startSession} />
        </>
      ) : (
        <>
          <Text style={styles.title}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
});

export default AlcoholTracker;