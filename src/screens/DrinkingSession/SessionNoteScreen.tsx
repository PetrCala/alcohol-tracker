import React, {useCallback} from 'react';
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
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SessionNoteForm';
import {StackScreenProps} from '@react-navigation/stack';
import {DrinkingSessionNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import TextInput from '@components/TextInput';
import Onyx, {useOnyx} from 'react-native-onyx';

type SessionNoteScreenProps = StackScreenProps<
  DrinkingSessionNavigatorParamList,
  typeof SCREENS.DRINKING_SESSION.SESSION_NOTE_SCREEN
>;

function SesssionNoteScreen({}: SessionNoteScreenProps) {
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  // const [sessionNote] = useOnyx(ONYXKEYS.DRINKING_SESSION_NOTE);
  const sessionNote = '';

  const onSubmit = async (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.SESSION_NOTE_FORM>,
  ) => {
    // Onyx.set(ONYXKEYS.DRINKING_SESSION_NOTE, values.note);
    Navigation.goBack();
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

  return (
    <ScreenWrapper
      includeSafeAreaPaddingBottom={false}
      testID={SesssionNoteScreen.displayName}>
      <HeaderWithBackButton
        title={translate('sessionNoteScreen.title')}
        onBackButtonPress={() => Navigation.goBack()}
      />
      <FormProvider
        style={[styles.flexGrow1, styles.ph5]}
        formID={ONYXKEYS.FORMS.SESSION_NOTE_FORM}
        validate={validate}
        onSubmit={onSubmit}
        submitButtonText={translate('common.save')}>
        <InputWrapper
          InputComponent={TextInput}
          inputID={INPUT_IDS.NOTE}
          label={translate('common.note')}
          defaultValue={sessionNote ?? ''}
        />
      </FormProvider>
    </ScreenWrapper>
  );
}

SesssionNoteScreen.displayName = 'SesssionNoteScreen';
export default SesssionNoteScreen;
