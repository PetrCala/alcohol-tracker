import React from 'react';
import {Text, View} from 'react-native';
// import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
// import ScreenWrapper from '@components/ScreenWrapper';

type NotFoundScreenProps = {
  onBackButtonPress?: () => void;
};

// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundScreen({onBackButtonPress}: NotFoundScreenProps) {
  return (
    <View style={{flex: 1, backgroundColor: 'pink'}}>
      <Text>Not found screen</Text>
    </View>
    // <ScreenWrapper testID={NotFoundScreen.displayName}>
    //   <FullPageNotFoundView shouldShow onBackButtonPress={onBackButtonPress} />
    // </ScreenWrapper>
  );
}

NotFoundScreen.displayName = 'NotFoundScreen';

export default NotFoundScreen;
