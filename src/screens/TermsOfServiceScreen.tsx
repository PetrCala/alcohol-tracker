import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import MenuIcon from '../components/Buttons/MenuIcon';
import { TermsOfServiceScreenProps } from '../types/screens';

const TermsOfServiceScreen = ({ navigation }: TermsOfServiceScreenProps) => {
  if (!navigation) return null; // Should never be null

  const termsHtml = require("../../assets/html/terms-of-service.html");

  const handleStartLoadWithRequest = (request:any) => {
      // Check if the URL has "mailto:" scheme
      if (request.url.startsWith('mailto:')) {
          // Use Linking to open the default email client
          Linking.openURL(request.url);
          return false; // Returning false prevents WebView from trying to handle the URL
      }
      return true;
  };

  return (
    <View style={{flex:1, backgroundColor: '#FFFF99'}}>
      <View style={styles.mainHeader}>
        <MenuIcon
          iconId='escape-terms-of-service-screen'
          iconSource={require('../../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack() }
        />
      </View>
      <View style={styles.mainContainer}>
        <WebView 
          originWhitelist={['*']}
          source={termsHtml}
          onShouldStartLoadWithRequest={handleStartLoadWithRequest}
          style={{ flex: 1 }} 
        />
      </View>
    </View>
  );
};

export default TermsOfServiceScreen;

const styles = StyleSheet.create({
  mainHeader: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
    shadowColor: '#000',             
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25,             
    shadowRadius: 3.84,              
    elevation: 5,
    zIndex: 1,
  },
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
