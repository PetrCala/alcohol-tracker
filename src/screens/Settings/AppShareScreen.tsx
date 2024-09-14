import MainHeader from '@components/Header/MainHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {StackScreenProps} from '@react-navigation/stack';
import type SCREENS from '@src/SCREENS';
import commonStyles from '@src/styles/commonStyles';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CONST from '@src/CONST';
import {copyToClipboard} from '@libs/StringUtilsKiroku';

type AppShareScreenProps = StackScreenProps<
  SettingsNavigatorParamList,
  typeof SCREENS.SETTINGS.APP_SHARE
>;

function AppShareScreen({route}: AppShareScreenProps) {
  const handleCopyLinkPress = () => {
    try {
      copyToClipboard(CONST.APP_DOWNLOAD_LINK, true);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScreenWrapper testID={AppShareScreen.displayName}>
      <MainHeader
        headerText="Share the app"
        onGoBack={() => Navigation.goBack()}
      />
      <View style={styles.mainContainer}>
        <View style={[styles.centeringContainer, styles.headingContainer]}>
          <Text style={styles.mainText}>Help us by sharing the app</Text>
        </View>
        <View style={[styles.centeringContainer, {height: '15%'}]}>
          <View
            style={[
              styles.centeringContainer,
              {height: '20%', flexDirection: 'row'},
            ]}>
            <Text style={styles.mainText}>either through a link</Text>
          </View>
          <View style={[styles.centeringContainer, {height: '80%'}]}>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.linkCopyButton}
              onPress={handleCopyLinkPress}>
              <Text style={styles.shareLinkText}>
                Copy share link to clipboard
              </Text>
              <Image source={KirokuIcons.Copy} style={styles.linkCopyImage} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={commonStyles.horizontalLine} />
        <View style={styles.qrCodeItemsContainer}>
          <View style={[styles.centeringContainer, {height: '15%'}]}>
            <Text style={styles.mainText}>or through a QR code</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => Linking.openURL(CONST.APP_QR_CODE_LINK)}
            style={[styles.centeringContainer, {height: 'auto'}]}>
            <Image source={KirokuIcons.QrCodeWithLogo} style={styles.qrCode} />
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffff99',
  },
  centeringContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headingContainer: {
    height: '10%',
    marginBottom: '5%',
  },
  itemsContainer: {
    height: '90%',
  },
  horizontalLineContainer: {
    height: '2%',
    width: '100%',
    marginTop: 0,
  },
  qrCodeItemsContainer: {
    width: '100%',
    height: '70%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  mainText: {
    fontSize: 17,
    color: 'black',
  },
  linkCopyButton: {
    width: 'auto',
    height: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  shareLinkText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'blue',
  },
  linkCopyImage: {
    marginLeft: 10,
    tintColor: 'black',
    width: 25,
    height: 25,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  copyQrCodeButton: {
    height: 'auto',
    width: 'auto',
    padding: 15,
  },
  copyQrCodeImage: {
    tintColor: 'black',
    width: 30,
    height: 30,
  },
});

AppShareScreen.displayName = 'App Share Screen';
export default AppShareScreen;
