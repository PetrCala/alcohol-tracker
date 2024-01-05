import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import commonStyles from '../styles/commonStyles';

type StatisticsProps = {
  navigation: any;
};

const StatisticsScreen = (props: StatisticsProps) => {
  const {navigation} = props;

  return (
    <View style={{flex: 1, backgroundColor: '#FFFF99'}}>
      <View style={commonStyles.mainHeader}>
        <MenuIcon
          iconId="escape-statistics-screen"
          iconSource={require('../../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.menuContainer}>
          <Text style={styles.sectionText}>Statistics</Text>
        </View>
      </View>
      <View style={styles.mainContainer}>
        <Text style={styles.sectionText}>Coming soon...</Text>
      </View>
    </View>
  );
};

export default StatisticsScreen;

const styles = StyleSheet.create({
  backArrowContainer: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  backArrow: {
    width: 25,
    height: 25,
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 200,
  },
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
