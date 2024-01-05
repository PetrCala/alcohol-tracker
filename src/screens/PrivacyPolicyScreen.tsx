import {useState, useEffect} from 'react';
import {
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import {PrivacyPolicyScreenProps} from '../types/screens';
import {WebView} from 'react-native-webview';
import commonStyles from '../styles/commonStyles';

const PrivacyPolicyScreen = ({navigation}: PrivacyPolicyScreenProps) => {
  const policyHtml =
    Platform.OS === 'android'
      ? {uri: 'file:///android_asset/html/privacy-policy.html'}
      : require('../../assets/html/privacy-policy.html');

  const handleStartLoadWithRequest = (request: any) => {
    // Check if the URL has "mailto:" scheme
    if (request.url.startsWith('mailto:')) {
      // Use Linking to open the default email client
      Linking.openURL(request.url);
      return false; // Returning false prevents WebView from trying to handle the URL
    }
    return true;
  };

  if (!navigation) return null; // Should never be null

  return (
    <View style={{flex: 1, backgroundColor: '#FFFF99'}}>
      <View style={commonStyles.mainHeader}>
        <MenuIcon
          iconId="escape-privacy-policy-screen"
          iconSource={require('../../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack()}
        />
      </View>
      <View style={styles.mainContainer}>
        <WebView
          originWhitelist={['*']}
          source={policyHtml}
          onShouldStartLoadWithRequest={handleStartLoadWithRequest}
          style={{flex: 1}}
          javaScriptEnabled
        />
      </View>
    </View>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  backArrowContainer: {
    justifyContent: 'center',
    marginTop: 10,
    marginLeft: 10,
    padding: 10,
    position: 'absolute',
  },
  backArrow: {
    width: 25,
    height: 25,
  },
  mainContainer: {
    flex: 1,
  },
});
