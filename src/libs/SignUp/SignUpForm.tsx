import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Login} from '@src/types/onyx';
import Terms from './Terms';

type SignUpFormOnyxProps = {
  /** State for the login */
  login: OnyxEntry<Login>;
};

type SignUpFormProps = SignUpFormOnyxProps;

function SignUpForm({login}: SignUpFormProps) {
  const network = useNetwork();
  const styles = useThemeStyles();
  const {translate} = useLocalize();

  return (
    <>
      <View style={[styles.mt3, styles.mb2]}>
        <Button
          isDisabled={network.isOffline}
          success
          large
          text={translate('welcomeSignUpForm.join')}
          isLoading={login?.isLoading}
          onPress={() => console.log('Signing up...')}
          // {/* // onPress={() => Session.signUpUser()} // TODO */}
          pressOnEnter
          style={[styles.mb2]}
        />
        <View style={[styles.mt4, styles.signUpScreenWelcomeTextContainer]}>
          <Terms />
        </View>
      </View>
    </>
  );
}
SignUpForm.displayName = 'SignUpForm';

export default withOnyx<SignUpFormProps, SignUpFormOnyxProps>({
  login: {key: ONYXKEYS.LOGIN},
})(SignUpForm);
