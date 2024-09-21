import {useFocusEffect} from '@react-navigation/native';
import lodashIsEmpty from 'lodash/isEmpty';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
// import FormProvider from '@components/Form/FormProvider';
// import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
// import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
// import updateMultilineInputRange from '@libs/updateMultilineInputRange';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
// import INPUT_IDS from '@src/types/form/MoneyRequestDescriptionForm';
import type * as OnyxTypes from '@src/types/onyx';
// import StepScreenWrapper from './StepScreenWrapper';
// import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import {StackScreenProps} from '@react-navigation/stack';
import {
  AuthScreensParamList,
  SettingsNavigatorParamList,
} from '@libs/Navigation/types';
import Text from '@components/Text';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

type ReEnterPasswordScreenOnyxProps = {};

type ReEnterPasswordScreenProps = ReEnterPasswordScreenOnyxProps &
  StackScreenProps<AuthScreensParamList, typeof SCREENS.RE_ENTER_PASSWORD>;

function ReEnterPasswordScreen({}: ReEnterPasswordScreenProps) {
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const inputRef = useRef<AnimatedTextInputRef | null>(null);

  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentDescription = '';

  useFocusEffect(
    useCallback(() => {
      focusTimeoutRef.current = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
        return () => {
          if (!focusTimeoutRef.current) {
            return;
          }
          clearTimeout(focusTimeoutRef.current);
        };
      }, CONST.ANIMATED_TRANSITION);
    }, []),
  );

  /**
   * @returns - An object containing the errors for each inputID
   */
  // const validate = useCallback(
  //   (
  //     values: FormOnyxValues<
  //       typeof ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM
  //     >,
  //   ): FormInputErrors<
  //     typeof ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM
  //   > => {
  //     const errors = {};

  //     if (values.moneyRequestComment.length > CONST.DESCRIPTION_LIMIT) {
  //       ErrorUtils.addErrorMessage(
  //         errors,
  //         'moneyRequestComment',
  //         translate('common.error.characterLimitExceedCounter', {
  //           length: values.moneyRequestComment.length,
  //           limit: CONST.DESCRIPTION_LIMIT,
  //         }),
  //       );
  //     }

  //     return errors;
  //   },
  //   [translate],
  // );

  const navigateBack = () => {
    Navigation.goBack();
  };

  const updateComment = (
    // value: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM>,
    value: any,
  ) => {
    console.debug('Updating comment');
    // const newComment = value.moneyRequestComment.trim();
    // IOU.updateMoneyRequestDescription(
    //   transaction?.transactionID ?? '-1',
    //   reportID,
    //   newComment,
    //   policy,
    //   policyTags,
    //   policyCategories,
    // );

    navigateBack();
  };

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
  // const isEditing = action === CONST.IOU.ACTION.EDIT;

  return (
    <ScreenWrapper testID={ReEnterPasswordScreen.displayName}>
      <HeaderWithBackButton title="Re-Enter Password" />
      <Text>Hello, world!</Text>

      {/* <FormProvider
        style={[styles.flexGrow1, styles.ph5]}
        formID={ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM}
        onSubmit={updateComment}
        validate={validate}
        submitButtonText={translate('common.save')}
        enabledWhenOffline>
        <View style={styles.mb4}>
          <InputWrapperWithRef
            InputComponent={TextInput}
            inputID={INPUT_IDS.MONEY_REQUEST_COMMENT}
            name={INPUT_IDS.MONEY_REQUEST_COMMENT}
            defaultValue={currentDescription}
            label={translate('moneyRequestConfirmationList.whatsItFor')}
            accessibilityLabel={translate(
              'moneyRequestConfirmationList.whatsItFor',
            )}
            role={CONST.ROLE.PRESENTATION}
            ref={el => {
              if (!el) {
                return;
              }
              if (!inputRef.current) {
                updateMultilineInputRange(el);
              }
              inputRef.current = el;
            }}
            autoGrowHeight
            maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
            shouldSubmitForm
            isMarkdownEnabled
            excludedMarkdownStyles={
              !isReportInGroupPolicy ? ['mentionReport'] : []
            }
          />
        </View>
      </FormProvider> */}
    </ScreenWrapper>
  );
}

ReEnterPasswordScreen.displayName = 'ReEnterPasswordScreen';

export default ReEnterPasswordScreen;
