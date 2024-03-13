import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import MainHeader from '@components/Header/MainHeader';
import Navigation from '@libs/Navigation/Navigation';


const StatisticsScreen = () => {
  return (
    <View style={{flex: 1, backgroundColor: '#FFFF99'}}>
      <MainHeader
        headerText="Statistics"
        onGoBack={() => Navigation.goBack()}
      />
      <View style={styles.mainContainer}>
        <Text style={styles.sectionText}>Coming soon...</Text>
      </View>
    </View>
  );
};

export default StatisticsScreen;

const styles = StyleSheet.create({
  sectionText: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    margin: 10,
    textAlign: 'center',
  },
  mainContainer: {
    flex: 1,
  },
});
