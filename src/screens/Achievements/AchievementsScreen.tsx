import React from 'react';
import {View} from 'react-native';
import Navigation from '@libs/Navigation/Navigation';
import ScreenWrapper from '@components/ScreenWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useLocalize from '@hooks/useLocalize';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

function AchievementsScreen() {
  const {translate} = useLocalize();
  const styles = useThemeStyles();

  return (
    <ScreenWrapper testID={AchievementsScreen.displayName}>
      <HeaderWithBackButton
        title={translate('achievementsScreen.title')}
        onBackButtonPress={Navigation.goBack}
      />
      <View style={styles.flex1}>
        <Text style={[styles.textLarge, styles.textAlignCenter]}>
          {translate('achievementsScreen.comingSoon')}
        </Text>
      </View>
    </ScreenWrapper>
  );
}

AchievementsScreen.displayName = 'Achievements Screen';
export default AchievementsScreen;
