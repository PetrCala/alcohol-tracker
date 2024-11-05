import React, {useCallback, useEffect, useState} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SessionNoteForm';
import type {DrinkingSession} from '@src/types/onyx';
import {Alert} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {DrinkingSessionNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import {useFirebase} from '@context/global/FirebaseContext';
import {readDataOnce} from '@database/baseFunctions';
import DBPATHS from '@database/DBPATHS';
import TextInput from '@components/TextInput';
import {saveDrinkingSessionData} from '@database/drinkingSessions';

type SessionNoteScreenProps = StackScreenProps<
  DrinkingSessionNavigatorParamList,
  typeof SCREENS.DRINKING_SESSION.SESSION_NOTE_SCREEN
>;

function SesssionNoteScreen({route}: SessionNoteScreenProps) {
  const {sessionId} = route.params;
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const [session, setSession] = useState<DrinkingSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.SESSION_NOTE_FORM>,
  ) => {
    if (!user || !session) {
      throw new Error(translate('sessionNoteScreen.error.generic'));
    }
    const newSession = {...session, note: values.note};

    try {
      setIsLoading(true);
      await saveDrinkingSessionData(
        db,
        user.uid,
        newSession,
        sessionId,
        false, // Do not update live status
      );
      Navigation.goBack();
    } catch (error: any) {
      Alert.alert(translate('sessionNoteScreen.error.generic'), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @returns An object containing the errors for each inputID
   */
  const validate = useCallback(
    (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SESSION_NOTE_FORM>) => {
      const errors = {};

      if (!ValidationUtils.isValidSessionNote(values.note)) {
        ErrorUtils.addErrorMessage(
          errors,
          'sessionNoteScreen',
          translate('sessionNoteScreen.error.noteTooLongError'),
        );
      }

      return errors;
    },
    [],
  );

  const fetchSession = async () => {
    if (!user) {
      throw new Error(translate('sessionNoteScreen.error.load'));
    }
    setIsLoading(true);
    let session: DrinkingSession | null = await readDataOnce(
      db,
      DBPATHS.USER_DRINKING_SESSIONS_USER_ID_SESSION_ID.getRoute(
        user.uid,
        sessionId,
      ),
    );
    setSession(session);
    setIsLoading(false);
  };

  // Prepare the session for the user upon component mount
  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <ScreenWrapper
      includeSafeAreaPaddingBottom={false}
      testID={SesssionNoteScreen.displayName}>
      <HeaderWithBackButton
        title={translate('common.dob')}
        onBackButtonPress={() => Navigation.goBack()}
      />
      {isLoading ? (
        <FullscreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
      ) : (
        <FormProvider
          style={[styles.flexGrow1, styles.ph5]}
          formID={ONYXKEYS.FORMS.SESSION_NOTE_FORM}
          validate={validate}
          onSubmit={onSubmit}
          submitButtonText={translate('common.save')}>
          <InputWrapper
            InputComponent={TextInput}
            inputID={INPUT_IDS.NOTE}
            label={translate('liveSessionScreen.note')}
            defaultValue={session?.note ?? ''}
          />
        </FormProvider>
      )}
    </ScreenWrapper>
  );
}

SesssionNoteScreen.displayName = 'SesssionNoteScreen';
export default SesssionNoteScreen;
