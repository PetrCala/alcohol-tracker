import React, {useRef, useState} from 'react';
import {useFirebase} from '@context/global/FirebaseContext';
import * as DS from '@libs/actions/DrinkingSession';
import type {DrinkingSession} from '@src/types/onyx';
import {useUserConnection} from '@context/global/UserConnectionContext';
import UserOffline from '@components/UserOfflineModal';
import CONST from '@src/CONST';
import type {StackScreenProps} from '@react-navigation/stack';
import type {DrinkingSessionNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import DrinkingSessionWindow from '@components/DrinkingSessionWindow';

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
  const initialSession = useRef<DrinkingSession | undefined>(session);
  // Session details
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);
  // Time info
  const [dbSyncSuccessful, setDbSyncSuccessful] = useState(false);
  const [discardModalVisible, setDiscardModalVisible] =
    useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');
  useState<boolean>(false);

  // const {isPending, enqueueUpdate} = useAsyncQueue(
  //   async (newSession: DrinkingSession) => syncWithDb(newSession),
  // );

  const syncWithDb = async (newSessionData: DrinkingSession) => {
    if (!user || !session) {
      return;
    }
    try {
      setDbSyncSuccessful(false);
      await DS.saveDrinkingSessionData(
        db,
        user.uid,
        newSessionData,
        sessionId,
        true, // Update live session status
      );
      setDbSyncSuccessful(true);
    } catch (error: any) {
      throw new Error(translate('liveSessionScreen.error.save'));
    }
  };

  // Fetch the session object at component mount
  // useEffect(() => {
  //   const newSession =
  //     liveSessionData?.id === sessionId ? liveSessionData : editSessionData;
  //   setSession(newSession);
  //   setSessionIsLive(!!newSession?.ongoing);

  //   // Set the intial session ref upon the first load
  //   if (isFetchingSessionData) {
  //     initialSession.current = newSession;
  //     setIsFetchingSessionData(false);
  //   }
  // }, []);

  // Synchronize the session with database
  // useEffect(() => {
  //   // Only schedule a database update if any hooks changed
  //   // Do not automatically save if the session is over, or
  //   // if the initial fetch has not finished
  //   if (!user || !sessionIsLive || !session || sessionFinished) {
  //     return;
  //   }
  //   enqueueUpdate({...session, ongoing: true});
  // }, [session]);

  if (!isOnline) {
    return <UserOffline />;
  }
  if (loadingText || !session) {
    return <FullScreenLoadingIndicator loadingText={loadingText} />;
  }

  return (
    <ScreenWrapper testID={LiveSessionScreen.displayName}>
      <DrinkingSessionWindow
        sessionId={sessionId}
        session={session}
        onyxKey={ONYXKEYS.LIVE_SESSION_DATA}
        type={CONST.SESSION_TYPES.LIVE}
      />
    </ScreenWrapper>
  );
}

LiveSessionScreen.displayName = 'Live Session Screen';
export default LiveSessionScreen;
