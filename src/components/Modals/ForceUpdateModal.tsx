import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import React from 'react';
import {View, Text, Linking} from 'react-native';

function ForceUpdateModal() {
  const styles = useThemeStyles();
  const storeLink =
    getPlatform() === CONST.PLATFORM.ANDROID
      ? CONST.STORE_LINKS.ANDROID
      : CONST.STORE_LINKS.IOS;

  return (
    <ScreenWrapper
      includePaddingTop={false}
      includeSafeAreaPaddingBottom={false}
      testID={'ForceUpdateModal'}>
      <View style={[styles.fullScreenCenteredContent, styles.p2]}>
        <Text style={styles.textHeadlineXXXLarge}>App Update Required</Text>
        <Text
          style={[
            styles.textAlignCenter,
            styles.textLarge,
            styles.p5,
            styles.textPlainColor,
          ]}>
          This version of the app is now discontinued. Please update to the
          latest version using the link below
          {getPlatform() === CONST.PLATFORM.IOS
            ? ' or from within the TestFlight app'
            : ''}
          .
        </Text>
        {storeLink && (
          <Text
            style={[styles.textLarge, styles.link]}
            onPress={() => Linking.openURL(storeLink)}>
            Update Now
          </Text>
        )}
      </View>
    </ScreenWrapper>
  );
}

export default ForceUpdateModal;
