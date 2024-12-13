import React, {useCallback} from 'react';
import {Alert, View} from 'react-native';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {FormOnyxValues} from '@src/components/Form/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReportBugForm';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import InputWrapper from '@components/Form/InputWrapper';
import variables from '@src/styles/variables';
import CONST from '@src/CONST';
import TextInput from '@components/TextInput';
import type {StackScreenProps} from '@react-navigation/stack';
import type SCREENS from '@src/SCREENS';
import {reportABug} from '@database/feedback';
import {useFirebase} from '@context/global/FirebaseContext';

type ReportBugScreenProps = StackScreenProps<
  SettingsNavigatorParamList,
  typeof SCREENS.SETTINGS.DELETE
>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ReportBugScreen({route}: ReportBugScreenProps) {
  const styles = useThemeStyles();
  const {translate} = useLocalize();
  const {db, auth} = useFirebase();
  const userID = auth.currentUser?.uid;

  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_BUG_FORM>,
  ) => {
    (async () => {
      try {
        setIsLoading(true);
        await reportABug(db, userID, values.text);
        Navigation.goBack();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '';
        Alert.alert('Failed to submit feedback', errorMessage);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const validate = useCallback(
    (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_BUG_FORM>): Errors => {
      const errors = ValidationUtils.getFieldRequiredErrors(values, ['text']);
      return errors;
    },
    [],
  );

  return (
    <ScreenWrapper
      includeSafeAreaPaddingBottom={false}
      testID={ReportBugScreen.displayName}>
      <HeaderWithBackButton
        title={translate('reportBugScreen.title')}
        shouldShowBackButton
        onBackButtonPress={Navigation.goBack}
      />
      {isLoading ? (
        <FullscreenLoadingIndicator
          style={[styles.flex1]}
          loadingText={translate('reportBugScreen.sending')}
        />
      ) : (
        <FormProvider
          formID={ONYXKEYS.FORMS.REPORT_BUG_FORM}
          validate={validate}
          onSubmit={onSubmit}
          submitButtonText={translate('reportBugScreen.submit')}
          style={[styles.flexGrow1, styles.mh5]}>
          <View style={[styles.flexGrow1]}>
            <Text>{translate('reportBugScreen.prompt')}</Text>
            <InputWrapper
              InputComponent={TextInput}
              inputID={INPUT_IDS.TEXT}
              autoGrowHeight
              maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
              label={translate('reportBugScreen.describeBug')}
              aria-label={translate('reportBugScreen.describeBug')}
              role={CONST.ROLE.PRESENTATION}
              maxLength={CONST.DESCRIPTION_LIMIT}
              spellCheck={false}
              containerStyles={[styles.mt5]}
            />
          </View>
        </FormProvider>
      )}
    </ScreenWrapper>
  );
}

ReportBugScreen.displayName = 'ReportBugScreen';

export default ReportBugScreen;
