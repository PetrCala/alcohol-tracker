import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import { TermsAndAgreementsScreenProps } from '../types/screens';


const TermsAndAgreementsScreen = ({ navigation }: TermsAndAgreementsScreenProps) => {
  if (!navigation) return null; // Should never be null

  return (
    <View style={{flex:1, backgroundColor: '#FFFF99'}}>
      <View style={styles.mainHeader}>
        <MenuIcon
          iconId='escape-social-screen'
          iconSource={require('../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack() }
        />
      </View>
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}> 
            Terms and Agreements placeholder
        </Text>
      </View>
    </View>
  );
};

export default TermsAndAgreementsScreen;

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
  },
  termsText: {
    fontSize: 15,
    color: 'black',
  }
});
