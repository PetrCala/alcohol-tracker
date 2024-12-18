import * as KirokuIcons from '@components/Icon/KirokuIcons';
import * as App from '@userActions/App';
import {useFirebase} from '@src/context/global/FirebaseContext';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as DS from '@userActions/DrinkingSession';
import {endOfToday} from 'date-fns';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Icon from '@components/Icon';
import useTheme from '@hooks/useTheme';
import ERRORS from '@src/ERRORS';
import variables from '@styles/variables';
import {PressableWithFeedback} from '@components/Pressable';

type AddSessionButtonProps = {
  currentDate: Date;
  isEditModeOn: boolean;
};

function AddSessionButton({currentDate, isEditModeOn}: AddSessionButtonProps) {
  const {auth, db} = useFirebase();
  const {translate} = useLocalize();
  const styles = useThemeStyles();
  const {textLight} = useTheme();
  const {userData} = useDatabaseData();

  if (!isEditModeOn) {
    return null;
  } // Do not display outside edit mode

  // No button if the date is in the future
  if (currentDate >= endOfToday()) {
    return null;
  }

  const onAddSessionButtonPress = () => {
    (async () => {
      try {
        await App.setLoadingText(translate('liveSessionScreen.loading'));
        const newSession = await DS.getNewSessionToEdit(
          db,
          auth.currentUser,
          currentDate,
          userData?.timezone?.selected,
        );
        DS.navigateToEditSessionScreen(newSession?.id);
      } catch (error) {
        ErrorUtils.raiseAppError(ERRORS.DATABASE.USER_CREATION_FAILED, error);
      } finally {
        await App.setLoadingText(null);
      }
    })();
  };

  return (
    <PressableWithFeedback
      accessibilityLabel={translate('dayOverviewScreen.addSessionExplained')}
      style={styles.floatingActionButton}
      onPress={onAddSessionButtonPress}>
      <Icon
        src={KirokuIcons.Plus}
        width={variables.iconSizeExtraLarge}
        height={variables.iconSizeExtraLarge}
        fill={textLight}
        additionalStyles={styles.appColor}
      />
    </PressableWithFeedback>
  );
}

export default AddSessionButton;
