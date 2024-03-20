import {Linking, Platform, StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';
import MainHeader from '@components/Header/MainHeader';
import Navigation from '@libs/Navigation/Navigation';
import ScreenWrapper from '@components/ScreenWrapper';

const TermsOfServiceScreen = () => {
  const termsHtml =
    Platform.OS === 'android'
      ? {uri: 'file:///android_asset/html/terms-of-service.html'}
      : require('@assets/html/terms-of-service.html');

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
    <ScreenWrapper testID={TermsOfServiceScreen.displayName}>
      <MainHeader headerText="" onGoBack={() => Navigation.goBack()} />
      <View style={styles.mainContainer}>
        <WebView
          originWhitelist={['*']}
          source={termsHtml}
          onShouldStartLoadWithRequest={handleStartLoadWithRequest}
          style={{flex: 1}}
          javaScriptEnabled
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFF99',
  },
});

TermsOfServiceScreen.displayName = 'Terms Of Service Screen';
export default TermsOfServiceScreen;
