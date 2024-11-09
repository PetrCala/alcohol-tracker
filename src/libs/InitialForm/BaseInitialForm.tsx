import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import Str from '@libs/common/str';
import type {ForwardedRef} from 'react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {InteractionManager, View} from 'react-native';
import Onyx, {useOnyx, withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
// import AppleSignIn from '@components/SignInButtons/AppleSignIn';
// import GoogleSignIn from '@components/SignInButtons/GoogleSignIn';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import INPUT_IDS from '@src/types/form/EmailForm';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import withToggleVisibilityView from '@components/withToggleVisibilityView';
import type {WithToggleVisibilityViewProps} from '@components/withToggleVisibilityView';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Browser from '@libs/Browser';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import * as ErrorUtils from '@libs/ErrorUtils';
import isInputAutoFilled from '@libs/isInputAutoFilled';
import * as LoginUtils from '@libs/LoginUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import Visibility from '@libs/Visibility';
import * as Session from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Login} from '@src/types/onyx';
import type InitialFormProps from './types';
import type {InputHandle} from './types';
import ChangeSignUpScreenLink from '@screens/SignUp/ChangeSignUpScreenLink';
import {useUserConnection} from '@context/global/UserConnectionContext';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import FormProvider from '@components/Form/FormProvider';
import {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {Errors} from '@src/types/onyx/OnyxCommon';
import InputWrapper from '@components/Form/InputWrapper';

type BaseInitialFormOnyxProps = {};

type BaseInitialFormProps = WithToggleVisibilityViewProps &
  BaseInitialFormOnyxProps &
  InitialFormProps;

function BaseInitialForm(
  {}: BaseInitialFormProps,
  ref: ForwardedRef<InputHandle>,
) {
  const styles = useThemeStyles();
  const {isOnline} = useUserConnection();
  const {translate} = useLocalize();
  const {shouldUseNarrowLayout} = useResponsiveLayout();
  const [login] = useOnyx(ONYXKEYS.LOGIN);

  const onSubmit = async (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.EMAIL_FORM>,
  ) => {
    if (!isOnline) {
      return;
    }

    // If account was closed and have success message in Onyx, we clear it here
    // if (closeAccount?.success) {
    //   CloseAccount.setDefaultData();
    // }

    const emailTrim = values.email.trim();

    Onyx.merge(ONYXKEYS.LOGIN, {
      email: emailTrim,
    });
    Navigation.navigate(ROUTES.SIGN_UP);
  };

  /**
   * Validate the input value and set the error for formError
   */
  const validate = useCallback(
    (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EMAIL_FORM>): Errors => {
      const errors: FormInputErrors<typeof ONYXKEYS.FORMS.EMAIL_FORM> = {};
      const loginTrim = values.email.trim();

      const errorKey = ValidationUtils.validateEmail(loginTrim);

      if (errorKey) {
        ErrorUtils.addErrorMessage(
          errors,
          INPUT_IDS.EMAIL,
          translate(errorKey),
        );
      }
      return errors;
    },
    [],
  );

  /**
   * Handle text input and validate the text input if it is blurred
   */
  // const onTextInput = useCallback(
  //   (text: string) => {
  //     if (!!login?.errors || !!login?.message) {
  //       Session.clearLoginMessages();
  //     }

  //     // Clear the "Account successfully closed" message when the user starts typing
  //     if (closeAccount?.success && !isInputAutoFilled(input.current)) {
  //       CloseAccount.setDefaultData();
  //     }
  //   },
  //   [login, closeAccount, input, onEmailChanged, validate],
  // );

  function getSignInWithStyles() {
    return shouldUseNarrowLayout ? [styles.mt1] : [styles.mt5, styles.mb5];
  }

  // const isSigningWithAppleOrGoogle = useRef(false);
  // const setIsSigningWithAppleOrGoogle = useCallback(
  //   (isPressed: boolean) => (isSigningWithAppleOrGoogle.current = isPressed),
  //   [],
  // );

  return (
    <>
      <FormProvider
        formID={ONYXKEYS.FORMS.EMAIL_FORM}
        validate={validate}
        onSubmit={onSubmit}
        submitButtonText={translate('common.continue')}
        shouldValidateOnChange={false}
        shouldValidateOnBlur={false}
        includeSafeAreaPaddingBottom={false}
        shouldUseScrollView={false}
        style={styles.flexGrow1}>
        <InputWrapper
          InputComponent={TextInput}
          inputID={INPUT_IDS.EMAIL}
          name="email"
          label={translate('login.email')}
          aria-label={translate('login.email')}
          defaultValue={login?.email ?? ''}
          spellCheck={false}
        />
        {!!login?.success && (
          <Text style={[styles.formSuccess]}>{login.success}</Text>
        )}
        {/* {(!!closeAccount?.success || !!login?.message) && (
          <DotIndicatorMessage
            style={[styles.mv2]}
            type="success"
            // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/prefer-nullish-coalescing
            messages={{
              0: closeAccount?.success
                ? closeAccount.success
                : login?.message || '',
            }}
          />
        )} */}
      </FormProvider>
      <ChangeSignUpScreenLink shouldPointToLogIn={true} />
      {/* --- OR --- */}
      {/* {
          // This feature has a few behavioral differences in development mode. To prevent confusion
          // for developers about possible regressions, we won't render buttons in development mode.
          // For more information about these differences and how to test in development mode,
          // see`Expensify/App/contributingGuides/APPLE_GOOGLE_SIGNIN.md`
          CONFIG.ENVIRONMENT !== CONST.ENVIRONMENT.DEV && (
              <View style={[getSignInWithStyles()]}>
                  <Text
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                      style={[styles.textLabelSupporting, styles.textAlignCenter, styles.mb3, styles.mt2]}
                  >
                      {translate('common.signInWith')}
                  </Text>

                  <View style={shouldUseNarrowLayout ? styles.loginButtonRowSmallScreen : styles.loginButtonRow}>
                      <View>
                          <AppleSignIn onPress={() => setIsSigningWithAppleOrGoogle(true)} />
                      </View>
                      <View>
                          <GoogleSignIn onPress={() => setIsSigningWithAppleOrGoogle(true)} />
                      </View>
                  </View>
              </View>
          )
      } */}
    </>
  );
}

BaseInitialForm.displayName = 'BaseInitialForm';
export default forwardRef(BaseInitialForm);
