import React from 'react';
import {View} from 'react-native';
// import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
// import ScreenWrapper from '@components/ScreenWrapper';

type NotFoundScreenProps = {
  onBackButtonPress?: () => void;
};

// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundScreen({onBackButtonPress}: NotFoundScreenProps) {
  return (
    <View style={{flex: 1}}></View>
    // <ScreenWrapper testID={NotFoundScreen.displayName}>
    //   <FullPageNotFoundView shouldShow onBackButtonPress={onBackButtonPress} />
    // </ScreenWrapper>
  );
}

NotFoundScreen.displayName = 'NotFoundScreen';

export default NotFoundScreen;
