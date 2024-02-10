import {
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import {TermsOfServiceScreenProps} from '../types/screens';
import {WebView} from 'react-native-webview';
import commonStyles from '../styles/commonStyles';
import MainHeader from '@components/Header/MainHeader';

const TermsOfServiceScreen = ({navigation}: TermsOfServiceScreenProps) => {
  if (!navigation) return null; // Should never be null

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
    <View style={{flex: 1, backgroundColor: '#FFFF99'}}>
      <MainHeader headerText="" onGoBack={() => navigation.goBack()} />
      <View style={styles.mainContainer}>
        <WebView
          originWhitelist={['*']}
          source={termsHtml}
          onShouldStartLoadWithRequest={handleStartLoadWithRequest}
          style={{flex: 1}}
          javaScriptEnabled
        />
      </View>
    </View>
  );
};

export default TermsOfServiceScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
});
