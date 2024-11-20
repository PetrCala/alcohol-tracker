import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useFirebase} from '@context/global/FirebaseContext';
import * as DS from '@libs/actions/DrinkingSession';
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
import {ActivityIndicator, StyleSheet} from 'react-native';
import _ from 'lodash';
import {diff} from 'deep-diff';
import ScreenWrapper from '@components/ScreenWrapper';
import SuccessIndicator from '@components/SuccessIndicator';
import commonStyles from '@src/styles/commonStyles';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import UserOfflineModal from '@components/UserOfflineModal';
import {
  computeFirebaseUpdates,
  differencesToUpdates,
} from '@database/baseFunctions';

type LiveSessionScreenProps = StackScreenProps<
  DrinkingSessionNavigatorParamList,
  typeof SCREENS.DRINKING_SESSION.LIVE
>;

function LiveSessionScreen({route}: LiveSessionScreenProps) {
  const {sessionId} = route.params;
  // Context, database, and authentification
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const {translate} = useLocalize();
  const {isOnline} = useUserConnection();
  const [session] = useOnyx(ONYXKEYS.LIVE_SESSION_DATA);
  const sessionRef = useRef<DrinkingSession | undefined>(undefined);
  // Session details
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);
  // Time info
  const [dbSyncSuccessful, setDbSyncSuccessful] = useState(false);
  const [loadingText, setLoadingText] = useState<string>('');
  useState<boolean>(false);

  const syncWithDb = async (updates: Partial<DrinkingSession>) => {
    if (!user) {
      return;
    }
    try {
      setDbSyncSuccessful(false);
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
    // Do not automatically save if the session is over, or
    // if the initial fetch has not finished
    const shouldRunUpdates =
      !!user &&
      !!session?.ongoing &&
      !!session &&
      !sessionFinished &&
      !!sessionRef.current;

    if (shouldRunUpdates) {
      const updates = computeFirebaseUpdates(sessionRef.current, session);
      if (updates && updates.length > 0) {
        enqueueUpdate(updates);
      }
    }
    sessionRef.current = session;
  }, [session, enqueueUpdate, user]);

  if (!isOnline) {
    return <UserOfflineModal />;
  }
  if (loadingText || !session) {
    return <FullScreenLoadingIndicator loadingText={loadingText} />;
  }

  return (
    <ScreenWrapper testID={LiveSessionScreen.displayName}>
      {isPending && (
        <ActivityIndicator
          size="small"
          color="#0000ff"
          style={localStyles.isPendingIndicator}
        />
      )}
      <SuccessIndicator
        visible={dbSyncSuccessful}
        successStyle={[localStyles.successStyle, commonStyles.successIndicator]}
      />
      <DrinkingSessionWindow
        sessionId={sessionId}
        session={session}
        onyxKey={ONYXKEYS.LIVE_SESSION_DATA}
        type={CONST.SESSION_TYPES.LIVE}
      />
    </ScreenWrapper>
  );
}

const localStyles = StyleSheet.create({
  isPendingIndicator: {
    width: 25,
    height: 25,
    margin: 4,
    position: 'absolute',
    right: 10,
    top: 70,
  },
  successStyle: {
    position: 'absolute',
    right: 10,
    top: 70,
  },
});

LiveSessionScreen.displayName = 'Live Session Screen';
export default LiveSessionScreen;
