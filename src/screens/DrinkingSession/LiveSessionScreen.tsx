import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useFirebase} from '@context/global/FirebaseContext';
import * as DS from '@userActions/DrinkingSession';
import type {DrinkingSession} from '@src/types/onyx';
import {useUserConnection} from '@context/global/UserConnectionContext';
import CONST from '@src/CONST';
import type {StackScreenProps} from '@react-navigation/stack';
import type {DrinkingSessionNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import useLocalize from '@hooks/useLocalize';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import DrinkingSessionWindow from '@components/DrinkingSessionWindow';
import useBatchedUpdates from '@hooks/useBatchedUpdates';
import _ from 'lodash';
import ScreenWrapper from '@components/ScreenWrapper';
import SuccessIndicator from '@components/SuccessIndicator';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import UserOfflineModal from '@components/UserOfflineModal';
import {computeFirebaseUpdates} from '@database/baseFunctions';
import useThemeStyles from '@hooks/useThemeStyles';
import useStyleUtils from '@hooks/useStyleUtils';
import FlexibleLoadingIndicator from '@components/FlexibleLoadingIndicator';

type LiveSessionScreenProps = StackScreenProps<
  DrinkingSessionNavigatorParamList,
  typeof SCREENS.DRINKING_SESSION.LIVE
>;

function LiveSessionScreen({route}: LiveSessionScreenProps) {
  const {sessionId} = route.params;
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const StyleUtils = useStyleUtils();
  const {translate} = useLocalize();
  const {isOnline} = useUserConnection();
  const [session] = useOnyx(ONYXKEYS.ONGOING_SESSION_DATA);
  const sessionRef = useRef<DrinkingSession | undefined>(undefined);
  const [dbSyncSuccessful, setDbSyncSuccessful] = useState(false);

  const syncWithDb = async (updates: Partial<DrinkingSession>) => {
    if (!user) {
      return;
    }
    try {
      await DS.updateDrinkingSessionData(
        db,
        user.uid,
        updates,
        sessionId,
        true, // Update live session status
      );
      setDbSyncSuccessful(true);
    } catch (error: any) {
      throw new Error(translate('liveSessionScreen.error.save'));
    }
  };

  const processUpdates = async (updates: Partial<DrinkingSession>) => {
    await syncWithDb(updates);
  };

  const {isPending, enqueueUpdate: batchedEnqueue} = useBatchedUpdates(
    processUpdates,
    500,
  );

  const enqueueUpdate = useCallback(
    (updates: Partial<DrinkingSession>) => {
      batchedEnqueue(updates);
    },
    [batchedEnqueue],
  );

  // Synchronize the session with database
  useEffect(() => {
    // Only schedule a database update if any hooks changed
    const shouldRunUpdates =
      !!user && !!session?.ongoing && !!session && !!sessionRef.current;

    if (shouldRunUpdates) {
      const updates = computeFirebaseUpdates(sessionRef.current, session);
      if (updates) {
        setDbSyncSuccessful(false);
        enqueueUpdate(updates);
      }
    }
    sessionRef.current = session;
  }, [session, user]);

  if (!isOnline) {
    return <UserOfflineModal />;
  }
  if (!session) {
    return <FullScreenLoadingIndicator />;
  }

  return (
    <ScreenWrapper testID={LiveSessionScreen.displayName}>
      {isPending && (
        <FlexibleLoadingIndicator
          size="small"
          style={StyleUtils.getSuccessIndicatorStyle()}
        />
      )}
      <SuccessIndicator visible={dbSyncSuccessful} />
      <DrinkingSessionWindow
        sessionId={sessionId}
        session={session}
        onyxKey={ONYXKEYS.ONGOING_SESSION_DATA}
        type={CONST.SESSION_TYPES.LIVE}
      />
    </ScreenWrapper>
  );
}

LiveSessionScreen.displayName = 'Live Session Screen';
export default LiveSessionScreen;
