import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {BackToParams} from '@libs/Navigation/types';
import type {FormOnyxValues} from '@src/components/Form/types';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/FeedbackForm';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';
import {Errors} from '@src/types/onyx/OnyxCommon';
import InputWrapper from '@components/Form/InputWrapper';
import variables from '@src/styles/variables';
import CONST from '@src/CONST';
import TextInput from '@components/TextInput';

type FeedbackScreenProps = {
  /** User's feedback */
  note?: string;

  /** Whether app is loading */
  isLoadingApp: OnyxEntry<boolean>;

  /** Function to call when feedback form is submitted */
  submitFeedback: (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.FEEDBACK_FORM>,
  ) => void;

  /** Title of feedback screen */
  title: string;
} & BackToParams;

function FeedbackScreen({
  title,
  note,
  submitFeedback,
  isLoadingApp = true,
  backTo,
}: FeedbackScreenProps) {
  const styles = useThemeStyles();
  const {translate} = useLocalize();

  const validate = useCallback(
    (values: FormOnyxValues<typeof ONYXKEYS.FORMS.FEEDBACK_FORM>): Errors => {
      const errors = ValidationUtils.getFieldRequiredErrors(values, ['text']);
      return errors;
    },
    [translate],
  );

  return (
    <ScreenWrapper
      includeSafeAreaPaddingBottom={false}
      testID={FeedbackScreen.displayName}>
      <HeaderWithBackButton
        title={title}
        shouldShowBackButton
        onBackButtonPress={() => Navigation.goBack(backTo)}
      />
      {isLoadingApp ? (
        <FullscreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
      ) : (
        <FormProvider
          formID={ONYXKEYS.FORMS.FEEDBACK_FORM}
          validate={validate}
          onSubmit={submitFeedback}
          submitButtonText={translate('deleteAccountScreen.deleteAccount')}
          style={[styles.flexGrow1, styles.mh5]}>
          <View style={[styles.flexGrow1]}>
            <Text>
              {translate('deleteAccountScreen.reasonForLeavingPrompt')}
            </Text>
            <InputWrapper
              InputComponent={TextInput}
              inputID={INPUT_IDS.TEXT}
              autoGrowHeight // ?
              maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight} // ?
              label={translate('deleteAccountScreen.enterMessageHere')}
              aria-label={translate('deleteAccountScreen.enterMessageHere')}
              role={CONST.ROLE.PRESENTATION}
              maxLength={CONST.LONG_FORM_CHARACTER_LIMIT}
              spellCheck={false}
              containerStyles={[styles.mt5]}
            />
          </View>
        </FormProvider>
      )}
    </ScreenWrapper>
  );
}

FeedbackScreen.displayName = 'FeedbackScreen';

export default FeedbackScreen;
