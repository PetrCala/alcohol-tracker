import React, {useState, useEffect, useMemo, useRef} from 'react';
import {BackHandler, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useFirebase} from '@context/global/FirebaseContext';
import * as DS from '@userActions/DrinkingSession';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import {
  getUniqueDrinkTypesInSession,
  sumAllDrinks,
  sumDrinksOfSingleType,
  convertUnitsToColors,
} from '@libs/DataHandling';
import Text from '@components/Text';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import type {DrinkingSession, DrinkKey} from '@src/types/onyx';
import DrinkTypesView from '@components/DrinkTypesView';
import SessionDetailsWindow from '@components/SessionDetailsWindow';
import FillerView from '@components/FillerView';
import CONST from '@src/CONST';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import useLocalize from '@hooks/useLocalize';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as App from '@userActions/App';
import ScrollView from '@components/ScrollView';
import Log from '@libs/Log';
import Icon from '@components/Icon';
import DateUtils from '@libs/DateUtils';
import {isEqual} from 'lodash';
import type {CalendarColors} from '@components/SessionsCalendar/types';
import type {User} from 'firebase/auth';
import {useFocusEffect} from '@react-navigation/native';
import ERRORS from '@src/ERRORS';
import type {DrinkingSessionWindowProps} from './types';

function DrinkingSessionWindow({
  onNavigateBack,
  sessionId,
  session,
  onyxKey,
  type,
}: DrinkingSessionWindowProps) {
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const theme = useTheme();
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const {preferences} = useDatabaseData();
  const sessionRef = useRef<DrinkingSession | undefined>(session);
  // Session details
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [sessionColor, setSessionColor] = useState<string>('green');
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);
  const waitForNavigate = useWaitForNavigation();
  // const [dbSyncSuccessful, setDbSyncSuccessful] = useState(false);
  const [discardModalVisible, setDiscardModalVisible] =
    useState<boolean>(false);
  const [shouldShowLeaveConfirmation, setShouldShowLeaveConfirmation] =
    useState(false);
  const sessionIsLive = session?.ongoing;
  const deleteSessionWording = session.ongoing
    ? translate('common.discard')
    : translate('common.delete');

  const hasSessionChanged = () => {
    return !isEqual(sessionRef.current, session);
  };

  async function saveSession(db: any, user: User | null) {
    if (!session || !user) {
      return;
    }
    if (totalUnits > CONST.MAX_ALLOWED_UNITS) {
      Log.warn('DrinkingSessionWindow - saveSession - Max units exceeded');
      return null;
    }
    if (totalUnits <= 0) {
      // TODO inform the user why the they can not save their session - 0 units
      return;
    }

    await App.setLoadingText(translate('liveSessionScreen.saving'));
    setSessionFinished(true); // No more db syncs
    const newSessionData: DrinkingSession = {
      ...session,
      end_time: session?.ongoing ? Date.now() : session.end_time,
    };
    delete newSessionData.ongoing;
    delete newSessionData.id;

    try {
      await DS.saveDrinkingSessionData(
        db,
        user.uid,
        newSessionData,
        sessionId,
        onyxKey,
        !!sessionIsLive, // Update status if the session is live
      );
      // Reroute to session summary, do not allow user to return
      onNavigateBack(CONST.NAVIGATION.SESSION_ACTION.SAVE);
    } catch (error) {
      ErrorUtils.raiseAppError(ERRORS.SESSION.SAVE_FAILED, error);
      setSessionFinished(false);
    } finally {
      await App.setLoadingText(null);
    }
  }

  const handleDiscardSession = async () => {
    setDiscardModalVisible(true);
  };

  const handleConfirmDiscard = async () => {
    if (!user) {
      return;
    }
    try {
      setDiscardModalVisible(false);
      await App.setLoadingText(
        translate('liveSessionScreen.discardingSession', {
          discardWord: sessionIsLive ? 'Discarding' : 'Deleting',
        }),
      );
      await DS.removeDrinkingSessionData(
        db,
        user.uid,
        sessionId,
        onyxKey,
        !!sessionIsLive,
      );
      onNavigateBack(CONST.NAVIGATION.SESSION_ACTION.DISCARD);
    } catch (error) {
      ErrorUtils.raiseAppError(ERRORS.SESSION.DISCARD_FAILED, error);
    } finally {
      await App.setLoadingText(null);
    }
  };

  /** If an update is pending, update immediately before navigating away
   */
  const handleBackPress = async () => {
    if (!sessionIsLive && hasSessionChanged()) {
      setShouldShowLeaveConfirmation(true); // Unsaved changes
      return;
    }
    confirmGoBack();
  };

  const confirmGoBack = async () => {
    setShouldShowLeaveConfirmation(false);
    onNavigateBack(CONST.NAVIGATION.SESSION_ACTION.BACK);
  };

  // Update the hooks whenever drinks change
  useMemo(() => {
    if (!preferences) {
      return;
    }
    const totalUnits = DSUtils.calculateTotalUnits(
      session?.drinks,
      preferences.drinks_to_units,
      true,
    );
    const sessionColor = convertUnitsToColors(
      totalUnits,
      preferences.units_to_colors,
    );
    setTotalUnits(totalUnits);
    setSessionColor(sessionColor);
  }, [session?.drinks]);

  // Make the system back press toggle the go back handler
  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true; // Prevent the event from bubbling up and being handled by the default handler
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, [session]);

  useFocusEffect(() => {
    App.setLoadingText(null);
  });

  return (
    <>
      <HeaderWithBackButton onBackButtonPress={handleBackPress} />
      <ScrollView contentContainerStyle={[styles.w100]}>
        <View style={styles.pt2}>
          <View style={styles.alignItemsCenter}>
            <Text style={styles.textHeadlineH2}>
              {session?.ongoing
                ? `${translate('liveSessionScreen.sessionFrom')} ${DateUtils.getLocalizedTime(session.start_time, session.timezone)}`
                : `${translate('liveSessionScreen.sessionOn')} ${DateUtils.getLocalizedDay(session.start_time, session.timezone)}`}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.pb2,
            styles.alignItemsCenter,
            styles.justifyContentCenter,
          ]}>
          <Text
            style={[
              styles.sessionUnitCountText(sessionColor as CalendarColors),
              styles.shadowStrong,
            ]}>
            {totalUnits}
          </Text>
        </View>
        <DrinkTypesView session={session} />
        <SessionDetailsWindow
          sessionId={sessionId}
          session={session}
          onBlackoutChange={(value: boolean) =>
            DS.updateBlackout(session, value)
          }
          shouldAllowDateChange={type !== CONST.SESSION.TYPES.LIVE}
          shouldAllowTimezoneChange={
            !session?.ongoing
            // session.type !== CONST.SESSION.TYPES.LIVE // Enable this down the line
          }
        />
        <FillerView />
      </ScrollView>
      <View style={[styles.bottomTabBarContainer, styles.gap4]}>
        <Button
          large
          text={translate('liveSessionScreen.discardSession', {
            discardWord: deleteSessionWording,
          })}
          style={styles.buttonLarge}
          onPress={handleDiscardSession}
        />
        <Button
          success
          large
          text={translate('liveSessionScreen.saveSession')}
          style={styles.buttonLargeSuccess}
          onPress={() => saveSession(db, user)}
        />
      </View>
      <ConfirmModal
        danger
        title={translate('common.warning')}
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardModalVisible(false)}
        isVisible={discardModalVisible}
        prompt={translate(
          'liveSessionScreen.discardSessionWarning',
          deleteSessionWording.toLowerCase(),
        )}
        confirmText={translate('common.yes')}
        cancelText={translate('common.no')}
        shouldDisableConfirmButtonWhenOffline
        shouldShowCancelButton
      />
      <ConfirmModal
        title={translate('common.warning')}
        onConfirm={() => confirmGoBack()} // No changes to the session object
        onCancel={() => setShouldShowLeaveConfirmation(false)}
        isVisible={shouldShowLeaveConfirmation}
        prompt={translate('liveSessionScreen.unsavedChangesWarning')}
        confirmText={translate('common.yes')}
        cancelText={translate('common.no')}
        shouldShowCancelButton
      />
      <ConfirmModal
        title={translate('common.warning')}
        onConfirm={() => confirmGoBack()} // No changes to the session object
        onCancel={() => setShouldShowLeaveConfirmation(false)}
        isVisible={shouldShowLeaveConfirmation}
        prompt={translate('liveSessionScreen.unsavedChangesWarning')}
        confirmText={translate('common.yes')}
        cancelText={translate('common.no')}
        shouldShowCancelButton
      />
    </>
  );
}

export default DrinkingSessionWindow;
