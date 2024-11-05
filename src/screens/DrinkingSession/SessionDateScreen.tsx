import {subYears} from 'date-fns';
import React, {useCallback, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SessionDateForm';
import type {PrivatePersonalDetails} from '@src/types/onyx';

type SesssionDateScreenOnyxProps = {
  /** User's private personal details */
  privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
  /** Whether app is loading */
  isLoadingApp: OnyxEntry<boolean>;
};
type SesssionDateScreenProps = SesssionDateScreenOnyxProps;

function SesssionDateScreen({
  privatePersonalDetails,
  isLoadingApp = true,
}: SesssionDateScreenProps) {
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const [isLoading, setIsLoading] = useState(false);

  //   const onSubmit = async (
  //     values: FormOnyxValues<typeof ONYXKEYS.FORMS.FEEDBACK_FORM>,
  //   ) => {
  //     try {
  //       setIsLoading(true);
  //       await submitFeedback(db, userID, values);
  //       Navigation.goBack();
  //     } catch (error: any) {
  //       Alert.alert('Failed to submit feedback', error.message);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  /**
   * @returns An object containing the errors for each inputID
   */
  const validate = useCallback(
    (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SESSION_DATE_FORM>) => {
      const requiredFields = ['date' as const];
      const errors = ValidationUtils.getFieldRequiredErrors(
        values,
        requiredFields,
      );

      return errors;
    },
    [],
  );

  return (
    <ScreenWrapper
      includeSafeAreaPaddingBottom={false}
      testID={SesssionDateScreen.displayName}>
      <HeaderWithBackButton
        title={translate('common.dob')}
        onBackButtonPress={() => Navigation.goBack()}
      />
      {/* // TODO enable this */}
      {/* {isLoadingApp ? (
        <FullscreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
      ) : (
        <FormProvider
          style={[styles.flexGrow1, styles.ph5]}
          formID={ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM}
          validate={validate}
          onSubmit={onSubmit}
          submitButtonText={translate('common.save')}
          enabledWhenOffline>
          <InputWrapper
            InputComponent={DatePicker}
            inputID={INPUT_IDS.DOB}
            label={translate('common.date')}
            defaultValue={privatePersonalDetails?.dob ?? ''}
            minDate={subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE)}
            maxDate={subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE)}
          />
        </FormProvider>
      )} */}
    </ScreenWrapper>
  );
}

SesssionDateScreen.displayName = 'SesssionDateScreen';
export default SesssionDateScreen;
