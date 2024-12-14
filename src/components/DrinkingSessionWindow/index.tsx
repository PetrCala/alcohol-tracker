import React, {useState, useEffect, useMemo, useRef} from 'react';
import {
  Alert,
  BackHandler,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFirebase} from '@context/global/FirebaseContext';
import * as DS from '@userActions/DrinkingSession';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import {
  getUniqueDrinkTypesInSession,
  sumAllDrinks,
  sumDrinksOfSingleType,
  unitsToColors,
} from '@libs/DataHandling';
import Text from '@components/Text';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import type {DrinkingSession, DrinkKey} from '@src/types/onyx';
import DrinkTypesView from '@components/DrinkTypesView';
import SessionDetailsWindow from '@components/SessionDetailsWindow';
import FillerView from '@components/FillerView';
import CONST from '@src/CONST';
import Navigation from '@navigation/Navigation';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import useLocalize from '@hooks/useLocalize';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as Utils from '@libs/Utils';
import ScrollView from '@components/ScrollView';
import Log from '@libs/Log';
import Icon from '@components/Icon';
import DateUtils from '@libs/DateUtils';
import {isEqual} from 'lodash';
import type {CalendarColors} from '@components/SessionsCalendar/types';
import type {User} from 'firebase/auth';
import {useFocusEffect} from '@react-navigation/native';
import type {DrinkingSessionWindowProps} from './types';
import ERRORS from '@src/ERRORS';

function DrinkingSessionWindow({
  onNavigateBack,
  sessionId,
  session,
  onyxKey,
  type,
}: DrinkingSessionWindowProps) {
  // Context, database, and authentification
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const theme = useTheme();
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const {preferences} = useDatabaseData();
  const {windowWidth} = useWindowDimensions();
  const sessionRef = useRef<DrinkingSession | undefined>(session);
  // Session details
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [sessionColor, setSessionColor] = useState<string>('green');
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);
  // // Time info
  const [monkeMode, setMonkeMode] = useState<boolean>(false);
  const waitForNavigate = useWaitForNavigation();
  // const [dbSyncSuccessful, setDbSyncSuccessful] = useState(false);
  // // Other
  const [discardModalVisible, setDiscardModalVisible] =
    useState<boolean>(false);
  const [shouldShowLeaveConfirmation, setShouldShowLeaveConfirmation] =
    useState(false);
  // useState<boolean>(false);
  const sessionIsLive = session?.ongoing;
  const deleteSessionWording = session.ongoing
    ? translate('common.discard')
    : translate('common.delete');

  const hasSessionChanged = () => {
    return !isEqual(sessionRef.current, session);
  };

  const handleMonkePlus = () => {
    DS.updateDrinks(
      sessionId,
      CONST.DRINKS.KEYS.OTHER,
      1,
      CONST.DRINKS.ACTIONS.ADD,
      preferences?.drinks_to_units,
    );
  };

  const handleMonkeMinus = () => {
    if (!session) {
      return;
    }
    const otherUnitsLeft = sumDrinksOfSingleType(
      session.drinks,
      CONST.DRINKS.KEYS.OTHER,
    );
    let keyToRemove: DrinkKey | null = null;
    if (otherUnitsLeft > 0) {
      // Try to remove a drink from 'others' first
      keyToRemove = CONST.DRINKS.KEYS.OTHER;
    } else if (sumAllDrinks(session.drinks) > 0) {
      // In case there are no other drinks, remove one at random
      const drinkKeysLeft = getUniqueDrinkTypesInSession(session);
      if (!drinkKeysLeft) {
        return;
      }
      keyToRemove =
        drinkKeysLeft[Math.floor(Math.random() * drinkKeysLeft.length)];
    }
    if (keyToRemove) {
      DS.updateDrinks(
        sessionId,
        keyToRemove,
        1,
        CONST.DRINKS.ACTIONS.REMOVE,
        preferences?.drinks_to_units,
      );
    }
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

    await Utils.setLoadingText(translate('liveSessionScreen.saving'));
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
      await Utils.setLoadingText(null);
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
      await Utils.setLoadingText(
        translate(
          'liveSessionScreen.discardingSession',
          sessionIsLive ? 'Discarding' : 'Deleting',
        ),
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
      await Utils.setLoadingText(null);
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
    const sessionColor = unitsToColors(totalUnits, preferences.units_to_colors);
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
    Utils.setLoadingText(null);
  });

  return (
    <>
      <HeaderWithBackButton
        onBackButtonPress={handleBackPress}
        customRightButton={
          sessionIsLive && (
            <Button
              onPress={() => setMonkeMode(!monkeMode)}
              text={translate(
                monkeMode
                  ? 'liveSessionScreen.exitMonkeMode'
                  : 'liveSessionScreen.enterMonkeMode',
              )}
              style={[
                styles.buttonMedium,
                monkeMode ? styles.buttonSuccessPressed : styles.buttonSuccess,
              ]}
              textStyles={styles.buttonLargeText}
            />
          )
        }
      />
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
        {monkeMode ? (
          <View style={localStyles.modifyUnitsContainer}>
            <TouchableOpacity
              accessibilityRole="button"
              style={[localStyles.modifyUnitsButton, {backgroundColor: 'red'}]}
              onPress={() => handleMonkeMinus()}>
              <Icon
                src={KirokuIcons.Minus}
                height={60}
                width={40}
                fill={theme.textLight}
              />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              style={[
                localStyles.modifyUnitsButton,
                {backgroundColor: 'green'},
              ]}
              onPress={() => handleMonkePlus()}>
              <Icon
                src={KirokuIcons.Plus}
                height={40}
                width={40}
                fill={theme.textLight}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <>
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
          </>
        )}
        <FillerView />
      </ScrollView>
      <View style={styles.bottomTabBarContainer}>
        <Button
          text={translate(
            'liveSessionScreen.discardSession',
            deleteSessionWording,
          )}
          textStyles={styles.buttonText}
          innerStyles={[
            styles.bottomTabBarItem,
            styles.halfScreenWidth(windowWidth * 0.8),
            styles.mh3,
          ]}
          onPress={handleDiscardSession}
        />
        <Button
          success
          text={translate('liveSessionScreen.saveSession')}
          textStyles={styles.buttonText}
          innerStyles={[
            styles.bottomTabBarItem,
            styles.halfScreenWidth(windowWidth * 0.8),
            styles.mh3,
          ]}
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

// eslint-disable-next-line @typescript-eslint/no-use-before-define
const localStyles = StyleSheet.create({
  modifyUnitsContainer: {
    height: 400,
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
  },
  modifyUnitsButton: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
});

export default DrinkingSessionWindow;
