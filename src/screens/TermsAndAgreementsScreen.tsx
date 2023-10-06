import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import MenuIcon from '../components/Buttons/MenuIcon';
import { TermsOfServiceScreenProps } from '../types/screens';


type TermsItemProps = {
  terms: string[];
};

const TermsItems: React.FC<TermsItemProps> = ({ terms }) => {
  return (
    <View style={styles.termsContainer}>
      <Text style={styles.termsHeading}> 
          Terms and Agreements
      </Text>
      {terms.map((term, index) => (
        <Text key={index} style={styles.termsText}>
          {`${index + 1}. ${term}`}
        </Text>
      ))}
    </View>
  );
};


const TermsOfServiceScreen = ({ navigation }: TermsOfServiceScreenProps) => {
  if (!navigation) return null; // Should never be null

  const termsAndAgreements = [
    'I solemnly swear to faithfully report all consumed units in their true form and amount',
  ]

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
      {/* <WebView 
        originWhitelist={['*']}
        source={Platform.OS === 'ios' ? require('../../assets/terms_of_service.html') : { uri: 'file:///android_asset/terms_of_service.html' }}
        style={{ flex: 1 }} 
      /> */}
      <TermsItems
        terms={termsAndAgreements}
      />
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
