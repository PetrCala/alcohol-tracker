import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import MenuIcon from '../components/Buttons/MenuIcon';
import { PrivacyPolicyScreenProps } from '../types/screens';



const PrivacyPolicyScreen = ({ navigation }: PrivacyPolicyScreenProps) => {
  if (!navigation) return null; // Should never be null

  return (
    <View style={{flex:1, backgroundColor: '#FFFF99'}}>
      <View style={styles.mainHeader}>
        <MenuIcon
          iconId='escape-privacy-policy-screen'
          iconSource={require('../../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack() }
        />
      </View>
      {/* <WebView 
        originWhitelist={['*']}
        source={Platform.OS === 'ios' ? require('../../assets/privacy_policy.html') : { uri: 'file:///android_asset/privacy_policy.html' }}
        style={{ flex: 1 }} 
      /> */}
    </View>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  mainHeader: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
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
  termsContainer: {
    flex: 1,
    backgroundColor: "#FFFF99",
    padding: 5,
  },
  termsHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    alignSelf: 'center',
    padding: 10,
  },
  termsText: {
    fontSize: 17,
    color: 'black',
    padding: 5,
    marginLeft: 5,
  }
});

