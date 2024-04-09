import React from 'react';
import {Text, View} from 'react-native';
// import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

type NotFoundScreenProps = {
  onBackButtonPress?: () => void;
};

// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundScreen({onBackButtonPress}: NotFoundScreenProps) {
  return (
    <ScreenWrapper testID={NotFoundScreen.displayName}>
      <View style={{flex: 1, backgroundColor: 'pink'}}>
        <Text>Not Found</Text>
      </View>
      {/* //   <FullPageNotFoundView shouldShow onBackButtonPress={onBackButtonPress} /> */}
    </ScreenWrapper>
  );
}

NotFoundScreen.displayName = 'NotFoundScreen';
export default NotFoundScreen;
