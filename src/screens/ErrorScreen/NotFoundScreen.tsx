import React from 'react';
import {Text, View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import useTheme from '@hooks/useTheme';
import Navigation from '@libs/Navigation/Navigation';
import ScreenWrapper from '@components/ScreenWrapper';
import MainHeader from '@components/Header/MainHeader';

type NotFoundScreenProps = {
  onBackButtonPress?: () => void;
};

// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundScreen({onBackButtonPress}: NotFoundScreenProps) {
  const styles = useThemeStyles();
  const theme = useTheme();
  return (
    <ScreenWrapper
      testID={NotFoundScreen.displayName}
      style={styles.appContent}>
      <MainHeader
        headerText={'Content Not Found'}
        onGoBack={() => Navigation.goBack()}
      />
      <View style={{backgroundColor: theme.appBG}}></View>
      {/* //   <FullPageNotFoundView shouldShow onBackButtonPress={onBackButtonPress} /> */}
    </ScreenWrapper>
  );
}

NotFoundScreen.displayName = 'NotFoundScreen';
export default NotFoundScreen;
