import useThemeStyles from '@hooks/useThemeStyles';
import {View, Text} from 'react-native';
import ScreenWrapper from './ScreenWrapper';

const UserOffline = () => {
  const styles = useThemeStyles();

  return (
    <ScreenWrapper
      includePaddingTop={false}
      includeSafeAreaPaddingBottom={false}
      testID={'UserOffline'}>
      <View style={[styles.fullScreenCenteredContent, styles.p2]}>
        <Text style={styles.textHeadlineXXXLarge}>You are offline</Text>
        <Text
          style={[
            styles.textAlignCenter,
            styles.textLarge,
            styles.p5,
            styles.textPlainColor,
          ]}>
          Unfortunately, Kiroku does not support offline mode yet. We appreciate
          your patience while we work on this feature.
        </Text>
      </View>
    </ScreenWrapper>
  );
};

export default UserOffline;
