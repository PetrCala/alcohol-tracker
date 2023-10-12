import React from 'react';
import { View, Text, Linking, StyleSheet, Platform } from 'react-native';
import { playStoreLink, iStoreLink } from '../utils/static';

const ForceUpdateScreen = () => {
  const storeLink = Platform.OS === "android" ? playStoreLink : iStoreLink
  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Update Required</Text>
      <Text style={styles.description}>
        This version of the app is now discontinued. Please update to the latest version.
      </Text>
      {storeLink ?
        <Text
          style={styles.updateLink}
          // onPress={() => Linking.openURL('itms-apps://your-app-store-link')}
          onPress={() => Linking.openURL(storeLink)}
        >
          Update Now
        </Text>
        :
        <></>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFF99',
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

export default ForceUpdateScreen;