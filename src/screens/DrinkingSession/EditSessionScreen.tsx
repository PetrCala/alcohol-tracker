import React from 'react';
import {useUserConnection} from '@context/global/UserConnectionContext';
import CONST from '@src/CONST';
import type {StackScreenProps} from '@react-navigation/stack';
import type {DrinkingSessionNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import DrinkingSessionWindow from '@components/DrinkingSessionWindow';
import _ from 'lodash';
import ScreenWrapper from '@components/ScreenWrapper';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import UserOfflineModal from '@components/UserOfflineModal';
import useLocalize from '@hooks/useLocalize';

type EditSessionScreenProps = StackScreenProps<
  DrinkingSessionNavigatorParamList,
  typeof SCREENS.DRINKING_SESSION.EDIT
>;

function EditSessionScreen({route}: EditSessionScreenProps) {
  const {sessionId} = route.params;
  const {isOnline} = useUserConnection();
  const {translate} = useLocalize();
  const [session] = useOnyx(ONYXKEYS.EDIT_SESSION_DATA);

  if (!isOnline) {
    return <UserOfflineModal />;
  }
  if (!session) {
    return (
      <FullScreenLoadingIndicator
        loadingText={translate('liveSessionScreen.loading')}
      />
    );
  }

  return (
    <ScreenWrapper testID={EditSessionScreen.displayName}>
      <DrinkingSessionWindow
        sessionId={sessionId}
        session={session}
        onyxKey={ONYXKEYS.EDIT_SESSION_DATA}
        type={CONST.SESSION.TYPES.EDIT}
      />
    </ScreenWrapper>
  );
}

EditSessionScreen.displayName = 'Edit Session Screen';
export default EditSessionScreen;
