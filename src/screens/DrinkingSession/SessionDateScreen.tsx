import {endOfToday, format, startOfDay} from 'date-fns';
import React, {useCallback, useEffect, useState} from 'react';
import DatePicker from '@components/DatePicker';
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
import * as DSUtils from '@libs/DrinkingSessionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SessionDateForm';
import type {DrinkingSession} from '@src/types/onyx';
import {Alert} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {DrinkingSessionNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import {useFirebase} from '@context/global/FirebaseContext';
import {readDataOnce} from '@database/baseFunctions';
import DBPATHS from '@database/DBPATHS';
import {saveDrinkingSessionData} from '@libs/actions/DrinkingSession';

type SessionDateScreenProps = StackScreenProps<
  DrinkingSessionNavigatorParamList,
  typeof SCREENS.DRINKING_SESSION.SESSION_DATE_SCREEN
>;

function SesssionDateScreen({route}: SessionDateScreenProps) {
  const {sessionId} = route.params;
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const [session, setSession] = useState<DrinkingSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.SESSION_DATE_FORM>,
  ) => {
    try {
      if (!user || !session) {
        throw new Error(translate('sessionDateScreen.error.load'));
      }

      const newDate = new Date(values.date);

      setIsLoading(true);
      const newSession = DSUtils.shiftSessionDate(session, newDate);
      await saveDrinkingSessionData(
        db,
        user.uid,
        newSession,
        sessionId,
        false, // Do not update live status
      );
      Navigation.goBack();
    } catch (error: any) {
      Alert.alert(translate('sessionDateScreen.error.generic'), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @returns An object containing the errors for each inputID
   */
  const validate = useCallback(
    (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SESSION_DATE_FORM>) => {
      const requiredFields = ['date' as const];
      const errors = ValidationUtils.getFieldRequiredErrors(
        values,
        requiredFields,
      );

      return errors;
    },
    [],
  );

  const fetchSession = async () => {
    if (!user) {
      throw new Error(translate('sessionDateScreen.error.load'));
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
      testID={SesssionDateScreen.displayName}>
      <HeaderWithBackButton
        title={translate('sessionDateScreen.title')}
        onBackButtonPress={() => Navigation.goBack()}
      />
      {isLoading ? (
        <FullscreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
      ) : (
        <FormProvider
          style={[styles.flexGrow1, styles.ph5]}
          formID={ONYXKEYS.FORMS.SESSION_DATE_FORM}
          validate={validate}
          onSubmit={onSubmit}
          submitButtonText={translate('common.save')}>
          <InputWrapper
            InputComponent={DatePicker}
            inputID={INPUT_IDS.DATE}
            label={translate('common.date')}
            defaultValue={
              session?.start_time
                ? format(
                    new Date(session?.start_time),
                    CONST.DATE.FNS_FORMAT_STRING,
                  )
                : ''
            }
            maxDate={endOfToday()}
          />
        </FormProvider>
      )}
    </ScreenWrapper>
  );
}

SesssionDateScreen.displayName = 'SesssionDateScreen';
export default SesssionDateScreen;
