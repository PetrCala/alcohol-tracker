// import React, {useCallback} from 'react';
// import {View} from 'react-native';
// import {withOnyx} from 'react-native-onyx';
// import type {OnyxEntry} from 'react-native-onyx';
// import type {FormInputErrors, FormOnyxValues} from '@src/components/Form/types';
// import useLocalize from '@hooks/useLocalize';
// import useNetwork from '@hooks/useNetwork';
// import useThemeStyles from '@hooks/useThemeStyles';
// import * as Session from '@userActions/Session';
// import * as ValidationUtils from '@libs/ValidationUtils';
// import * as ErrorUtils from '@libs/ErrorUtils';
// import INPUT_IDS from '@src/types/form/LogInForm';
// import {Errors} from '@src/types/onyx/OnyxCommon';
// import ONYXKEYS from '@src/ONYXKEYS';
// import type {Login} from '@src/types/onyx';
// import Text from '@components/Text';
// import variables from '@src/styles/variables';
// import TextInput from '@components/TextInput';
// import FormProvider from '@components/Form/FormProvider';
// import InputWrapper from '@components/Form/InputWrapper';
// import CONST from '@src/CONST';
// import Button from '@components/Button';
// import ChangeKirokuLoginLink from '../ChangeKirokuLoginLink';

// type LogInFormOnyxProps = {
//   /** State for the account */
//   login: OnyxEntry<Login>;

//   /** Whether the login form should be hidden */
//   setLogInFormHidden: (isHidden: boolean) => void;
// };

// type LogInFormProps = LogInFormOnyxProps;

// function LogInForm({login, setLogInFormHidden}: LogInFormProps) {
//   const network = useNetwork();
//   const styles = useThemeStyles();
//   const {translate} = useLocalize();

//   const onSubmit = async (
//     values: FormOnyxValues<typeof ONYXKEYS.FORMS.EMAIL_FORM>,
//   ) => {
//     console.log('Logging in with email: ', values.email);
//   };

//   const validate = useCallback(
//     (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EMAIL_FORM>): Errors => {
//       const errors: FormInputErrors<typeof ONYXKEYS.FORMS.EMAIL_FORM> = {};
//       return errors;

//       //   if (values.email.length === 0) {
//       //     ErrorUtils.addErrorMessage(
//       //       errors,
//       //       INPUT_IDS.EMAIL,
//       //       translate('emailScreen.error.emailRequired'),
//       //     );
//       //   } else if (!ValidationUtils.isValidEmail(values.email)) {
//       //     ErrorUtils.addErrorMessage(
//       //       errors,
//       //       INPUT_IDS.EMAIL,
//       //       translate('emailScreen.error.invalidEmail'),
//       //     );
//       //   } else if (values.email === currentEmail) {
//       //     ErrorUtils.addErrorMessage(
//       //       errors,
//       //       INPUT_IDS.EMAIL,
//       //       translate('emailScreen.error.sameEmail'),
//       //     );
//       //   } else if (values.email.length > CONST.EMAIL_MAX_LENGTH) {
//       //     ErrorUtils.addErrorMessage(
//       //       errors,
//       //       INPUT_IDS.EMAIL,
//       //       translate('emailScreen.error.emailTooLong'),
//       //     );
//       //   }
//       //   return errors;
//       // },
//     },
//     [translate],
//   );
//   return (
//     <>
//       <View style={[styles.mt3, styles.mb2]}>
//         <FormProvider
//           formID={ONYXKEYS.FORMS.EMAIL_FORM}
//           validate={validate}
//           onSubmit={onSubmit}
//           shouldUseScrollView={false}
//           submitButtonText={translate('login.logIn')}
//           style={[styles.flexGrow1, styles.mh5]}>
//           <View style={[styles.flexGrow1]}>
//             <InputWrapper
//               InputComponent={TextInput}
//               inputID={INPUT_IDS.EMAIL}
//               name="email"
//               autoGrowHeight
//               maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
//               label={translate('login.email')}
//               aria-label={translate('login.email')}
//               defaultValue={login?.email ?? ''}
//               spellCheck={false}
//               containerStyles={[styles.mt5]}
//             />
//           </View>
//         </FormProvider>
//         <ChangeKirokuLoginLink onPress={() => setLogInFormHidden(true)} />
//         {/* <Button
//           isDisabled={network.isOffline || !!login?.message}
//           success
//           large
//           text={translate('welcomeSignUpForm.join')}
//           isLoading={login?.isLoading}
//           onPress={() => {}} //Session.signUpUser()}
//           pressOnEnter
//           style={[styles.mb2]}
//         /> */}
//       </View>
//     </>
//   );
// }
// LogInForm.displayName = 'LogInForm';

// export default withOnyx<LogInFormProps, LogInFormOnyxProps>({
//   login: {key: ONYXKEYS.LOGIN},
// })(LogInForm);
