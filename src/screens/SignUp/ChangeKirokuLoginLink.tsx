import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ChangeKirokuLoginLinkOnyxProps = {};

type ChangeKirokuLoginLinkProps = ChangeKirokuLoginLinkOnyxProps & {
  onPress: () => void;
};

function ChangeKirokuLoginLink({onPress}: ChangeKirokuLoginLinkProps) {
  const styles = useThemeStyles();
  const {translate} = useLocalize();

  return (
    <View style={styles.changeKirokuLoginLinkContainer}>
      <Text style={styles.mr1}>{translate('login.existingAccount')}</Text>
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
>({})(ChangeKirokuLoginLink);
