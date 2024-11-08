import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Credentials} from '@src/types/onyx';

type ChangeKirokuLoginLinkOnyxProps = {
  /** The credentials of the person logging in */
  credentials: OnyxEntry<Credentials>;
};

type ChangeKirokuLoginLinkProps = ChangeKirokuLoginLinkOnyxProps & {
  onPress: () => void;
};

function ChangeKirokuLoginLink({
  credentials,
  onPress,
}: ChangeKirokuLoginLinkProps) {
  const styles = useThemeStyles();
  const {translate} = useLocalize();

  return (
    <View style={styles.changeKirokuLoginLinkContainer}>
      <Text style={styles.mr1}>{translate('initialForm.existingAccount')}</Text>
      <PressableWithFeedback
        style={[styles.link]}
        onPress={onPress}
        role={CONST.ROLE.LINK}
        accessibilityLabel={translate('common.logIn')}>
        <Text style={[styles.link]}>{translate('common.logIn')}</Text>
      </PressableWithFeedback>
    </View>
  );
}

ChangeKirokuLoginLink.displayName = 'ChangeKirokuLoginLink';

export default withOnyx<
  ChangeKirokuLoginLinkProps,
  ChangeKirokuLoginLinkOnyxProps
>({
  credentials: {
    key: ONYXKEYS.CREDENTIALS,
  },
})(ChangeKirokuLoginLink);
