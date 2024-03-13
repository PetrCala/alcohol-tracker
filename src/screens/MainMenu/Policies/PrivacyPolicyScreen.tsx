import {Linking, Platform, StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';
import MainHeader from '@components/Header/MainHeader';
import Navigation from '@libs/Navigation/Navigation';

const PrivacyPolicyScreen = () => {
  const policyHtml =
    Platform.OS === 'android'
      ? {uri: 'file:///android_asset/html/privacy-policy.html'}
      : require('@assets/html/privacy-policy.html');

  const handleStartLoadWithRequest = (request: any) => {
    // Check if the URL has "mailto:" scheme
    if (request.url.startsWith('mailto:')) {
      // Use Linking to open the default email client
      Linking.openURL(request.url);
      return false; // Returning false prevents WebView from trying to handle the URL
    }
    return true;
  };

  return (
    <View style={{flex: 1, backgroundColor: '#FFFF99'}}>
      <MainHeader headerText="" onGoBack={() => Navigation.goBack()} />
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
  mainContainer: {
    flex: 1,
  },
});
