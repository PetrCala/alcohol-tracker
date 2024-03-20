import useTheme from '@hooks/useTheme';
import CONST from '@src/CONST';
import React from 'react';
import {View, Text, Linking, StyleSheet, Platform} from 'react-native';

const ForceUpdateModal = () => {
  const theme = useTheme();
  const storeLink =
    Platform.OS === 'android'
      ? CONST.STORE_LINKS.ANDROID
      : CONST.STORE_LINKS.IOS;
  return (
    <View style={[styles.mainContainer, {backgroundColor: theme.appBG}]}>
      <Text style={styles.title}>App Update Required</Text>
      <Text style={styles.description}>
        This version of the app is now discontinued. Please update to the latest
        version using the link below
        {Platform.OS === 'ios' ? ' or from within the TestFlight app' : ''}.
      </Text>
      {storeLink ? (
        <Text
          style={styles.updateLink}
          onPress={() => Linking.openURL(storeLink)}>
          Update Now
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
    color: 'black',
  },
  updateLink: {
    fontSize: 18,
    color: 'blue',
  },
});

export default ForceUpdateModal;
