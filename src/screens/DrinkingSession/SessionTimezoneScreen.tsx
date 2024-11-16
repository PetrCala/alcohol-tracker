import React, {useCallback, useEffect} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as DS from '@libs/actions/DrinkingSession';
import ONYXKEYS from '@src/ONYXKEYS';
import {StackScreenProps} from '@react-navigation/stack';
import {DrinkingSessionNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import TextInput from '@components/TextInput';
import Text from '@components/Text';

type SessionTimezoneScreenProps = StackScreenProps<
  DrinkingSessionNavigatorParamList,
  typeof SCREENS.DRINKING_SESSION.SESSION_TIMEZONE_SCREEN
>;

function SesssionTimezoneScreen({route}: SessionTimezoneScreenProps) {
  const {sessionId} = route.params;
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const session = DS.getDrinkingSessionData(sessionId);

  // const onSubmit = async (
  //   values: FormOnyxValues<typeof ONYXKEYS.FORMS.SESSION_NOTE_FORM>,
  // ) => {
  //   DS.updateTimezone(session, values.note);
  //   Navigation.goBack();
  // };

  // /**
  //  * @returns An object containing the errors for each inputID
  //  */
  // const validate = useCallback(
  //   (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SESSION_NOTE_FORM>) => {
  //     const errors = {};

  //     if (!ValidationUtils.isValidSessionTimezone(values.note)) {
  //       ErrorUtils.addErrorMessage(
  //         errors,
  //         'sessionTimezoneScreen',
  //         translate('sessionTimezoneScreen.error.noteTooLongError'),
  //       );
  //     }

  //     return errors;
  //   },
  //   [],
  // );

  return (
    <ScreenWrapper
      includeSafeAreaPaddingBottom={false}
      testID={SesssionTimezoneScreen.displayName}>
      <HeaderWithBackButton
        title={translate('sessionTimezoneScreen.title')}
        onBackButtonPress={() => Navigation.goBack()}
      />
      {/* <FormProvider
        style={[styles.flexGrow1, styles.ph5]}
        formID={ONYXKEYS.FORMS.SESSION_NOTE_FORM}
        validate={validate}
        onSubmit={onSubmit}
        submitButtonText={translate('common.save')}>
        <Text style={[styles.mb6]}>
          {translate('sessionTimezoneScreen.noteDescription')}
        </Text>
        <InputWrapper
          InputComponent={TextInput}
          inputID={INPUT_IDS.NOTE}
          label={translate('common.note')}
          defaultValue={session?.note ?? ''}
        /> */}
    </ScreenWrapper>
  );
}

SesssionTimezoneScreen.displayName = 'SesssionTimezoneScreen';
export default SesssionTimezoneScreen;
