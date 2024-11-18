import useThemeStyles from '@hooks/useThemeStyles';
import {View, Text} from 'react-native';
import SafeAreaConsumer from './SafeAreaConsumer';
import Modal from './Modal';
import CONST from '@src/CONST';
import useLocalize from '@hooks/useLocalize';

function UserOfflineModal() {
  const styles = useThemeStyles();
  const {translate} = useLocalize();

  return (
    <SafeAreaConsumer>
      {() => (
        <Modal
          onClose={() => {}}
          isVisible={true}
          type={CONST.MODAL.MODAL_TYPE.CENTERED}>
          <View style={[styles.fullScreenCenteredContent, styles.pb8]}>
            <Text style={styles.textHeadlineXXXLarge}>
              {translate('userOffline.heading')}
            </Text>
            <Text
              style={[
                styles.textAlignCenter,
                styles.textLarge,
                styles.p5,
                styles.textPlainColor,
              ]}>
              {translate('userOffline.text')}
            </Text>
          </View>
        </Modal>
      )}
    </SafeAreaConsumer>
  );
}

export default UserOfflineModal;
