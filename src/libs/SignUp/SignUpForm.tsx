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
import type {Account} from '@src/types/onyx';
import ChangeKirokuLoginLink from './ChangeKirokuLoginLink';
import Terms from './Terms';

type SignUpFormOnyxProps = {
  /** State for the account */
  account: OnyxEntry<Account>;
};

type SignUpFormProps = SignUpFormOnyxProps;

function SignUpForm({account}: SignUpFormProps) {
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
          isLoading={account?.isLoading}
          onPress={() => console.log('Signing up...')}
          // {/* // onPress={() => Session.signUpUser()} // TODO */}
          pressOnEnter
          style={[styles.mb2]}
        />
      </View>
    </>
  );
}
SignUpForm.displayName = 'SignUpForm';

export default withOnyx<SignUpFormProps, SignUpFormOnyxProps>({
  account: {key: ONYXKEYS.ACCOUNT},
})(SignUpForm);
