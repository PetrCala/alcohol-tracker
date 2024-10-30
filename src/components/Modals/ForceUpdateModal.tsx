import Modal from '@components/Modal';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import React from 'react';
import {View, Text, Linking} from 'react-native';

function ForceUpdateModal() {
  const styles = useThemeStyles();
  const {translate} = useLocalize();

  const currentPlatform = getPlatform();
  const storeLink =
    currentPlatform === CONST.PLATFORM.ANDROID
      ? CONST.STORE_LINKS.ANDROID
      : CONST.STORE_LINKS.IOS;

  return (
    <SafeAreaConsumer>
      {() => (
        <Modal
          onClose={() => {}}
          isVisible={true}
          type={CONST.MODAL.MODAL_TYPE.CENTERED}>
          <View style={[styles.fullScreenCenteredContent, styles.p2]}>
            <Text style={styles.textHeadlineXXXLarge}>
              {translate('forceUpdate.heading')}
            </Text>
            <Text
              style={[
                styles.textAlignCenter,
                styles.textLarge,
                styles.p5,
                styles.textPlainColor,
              ]}>
              {translate('forceUpdate.text', currentPlatform)}
            </Text>
            {storeLink && (
              <Text
                style={[styles.textLarge, styles.link]}
                onPress={() => Linking.openURL(storeLink)}>
                {translate('forceUpdate.link')}
              </Text>
            )}
          </View>
        </Modal>
      )}
    </SafeAreaConsumer>
  );
}

export default ForceUpdateModal;
