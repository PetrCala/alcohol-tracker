import React, {useRef} from 'react';
import type {DrinkingSession} from '@src/types/onyx';
import {useUserConnection} from '@context/global/UserConnectionContext';
import CONST from '@src/CONST';
import type {StackScreenProps} from '@react-navigation/stack';
import type {DrinkingSessionNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
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
  const sessionRef = useRef<DrinkingSession | undefined>(undefined);

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
        type={CONST.SESSION_TYPES.EDIT}
      />
    </ScreenWrapper>
  );
}

EditSessionScreen.displayName = 'Edit Session Screen';
export default EditSessionScreen;
