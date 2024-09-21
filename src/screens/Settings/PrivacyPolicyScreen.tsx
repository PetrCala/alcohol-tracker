import {Linking, Platform, StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';
import Navigation from '@libs/Navigation/Navigation';
import ScreenWrapper from '@components/ScreenWrapper';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useState} from 'react';
import LoadingData from '@components/LoadingData';
import useThemeStyles from '@hooks/useThemeStyles';

function PrivacyPolicyScreen() {
  const styles = useThemeStyles();
  const [isLoading, setIsLoading] = useState(false);

  const policyHtml =
    getPlatform() === CONST.PLATFORM.ANDROID
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
    <ScreenWrapper testID={PrivacyPolicyScreen.displayName}>
      <HeaderWithBackButton onBackButtonPress={Navigation.goBack} />
      <View style={[styles.flex1, styles.appContent]}>
        {isLoading ? (
          <LoadingData />
        ) : (
          <WebView
            originWhitelist={['*']}
            source={policyHtml}
            onShouldStartLoadWithRequest={handleStartLoadWithRequest}
            style={{flex: 1}}
            onLoadEnd={() => setIsLoading(false)}
            javaScriptEnabled
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

PrivacyPolicyScreen.displayName = 'Privacy Policy Screen';
export default PrivacyPolicyScreen;
