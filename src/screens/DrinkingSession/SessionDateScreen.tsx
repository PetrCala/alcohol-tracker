import {endOfToday, format} from 'date-fns';
import React, {useCallback} from 'react';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SessionDateForm';
import {Alert} from 'react-native';
import type {StackScreenProps} from '@react-navigation/stack';
import type {DrinkingSessionNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import {useFirebase} from '@context/global/FirebaseContext';
import * as DS from '@userActions/DrinkingSession';
import * as DSUtils from '@libs/DrinkingSessionUtils';
import Text from '@components/Text';
import type {TranslationPaths} from '@src/languages/types';
import Onyx, {useOnyx} from 'react-native-onyx';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

type SessionDateScreenProps = StackScreenProps<
  DrinkingSessionNavigatorParamList,
  typeof SCREENS.DRINKING_SESSION.SESSION_DATE_SCREEN
>;

function SesssionDateScreen({route}: SessionDateScreenProps) {
  const {sessionId, backTo} = route.params;
  const {auth} = useFirebase();
  const user = auth.currentUser;
  const [isBeingCreated] = useOnyx(ONYXKEYS.IS_CREATING_NEW_SESSION);
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const session = DSUtils.getDrinkingSessionData(sessionId);

  const confirmTextKey: TranslationPaths = isBeingCreated
    ? 'common.confirm'
    : 'common.save';

  const onGoBack = async () => {
    if (isBeingCreated) {
      await Onyx.set(ONYXKEYS.IS_CREATING_NEW_SESSION, false);
    }
    if (backTo) {
      Navigation.navigate(backTo as Route);
      return;
    }
    Navigation.goBack();
  };

  const onSubmit = async (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.SESSION_DATE_FORM>,
  ) => {
    if (!user || !session) {
      Alert.alert(translate('sessionDateScreen.error.load'));
      return;
    }
    await DS.updateSessionDate(sessionId, session, new Date(values.date));
    if (isBeingCreated) {
      await Onyx.set(ONYXKEYS.IS_CREATING_NEW_SESSION, false);
      DS.navigateToEditSessionScreen(sessionId, undefined, ROUTES.HOME);
    } else {
      onGoBack();
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

  return (
    <ScreenWrapper
      includeSafeAreaPaddingBottom={false}
      testID={SesssionDateScreen.displayName}>
      <HeaderWithBackButton
        title={translate('sessionDateScreen.title')}
        onBackButtonPress={onGoBack}
      />
      <FormProvider
        style={[styles.flexGrow1, styles.ph5]}
        formID={ONYXKEYS.FORMS.SESSION_DATE_FORM}
        validate={validate}
        onSubmit={onSubmit}
        submitButtonText={translate(confirmTextKey)}>
        <Text style={[styles.mb3]}>
          {translate('sessionDateScreen.prompt')}
        </Text>
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
    </ScreenWrapper>
  );
}

SesssionDateScreen.displayName = 'SesssionDateScreen';
export default SesssionDateScreen;
