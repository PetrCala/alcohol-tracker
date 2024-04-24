import BasicButton from '@components/Buttons/BasicButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import MainHeader from '@components/Header/MainHeader';
import LoadingData from '@components/LoadingData';
import MenuItemGroup from '@components/MenuItemGroup';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Section from '@components/Section';
import ProfileOverview from '@components/Social/ProfileOverview';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {ProfileNavigatorParamList} from '@libs/Navigation/types';
import type {StackScreenProps} from '@react-navigation/stack';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {useState} from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const propTypes = {
  /* Onyx Props */
};

type EditScreenProps = StackScreenProps<
  ProfileNavigatorParamList,
  typeof SCREENS.PROFILE.EDIT
>;

function EditScreen({route}: EditScreenProps) {
  const theme = useTheme();
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const {translate} = useLocalize();
  const userId = route.params.userId;
  const {userData, isLoading} = useDatabaseData();
  const profileData = userData?.profile;

  const publicOptions = [
    {
      description: 'test',
      title: 'test',
      pageRoute: ROUTES.HOME,
    },
    {
      description: 'test2',
      title: 'test2',
      pageRoute: ROUTES.HOME,
    },
    // {
    //     description: translate('displayNamePage.headerTitle'),
    //     title: currentUserPersonalDetails?.displayName ?? '',
    //     pageRoute: ROUTES.SETTINGS_DISPLAY_NAME,
    // },
    // {
    //     description: translate('contacts.contactMethod'),
    //     title: LocalePhoneNumber.formatPhoneNumber(currentUserPersonalDetails?.login ?? ''),
    //     pageRoute: ROUTES.SETTINGS_CONTACT_METHODS.route,
    //     brickRoadIndicator: contactMethodBrickRoadIndicator,
    // },
    // {
    //     description: translate('statusPage.status'),
    //     title: emojiCode ? `${emojiCode} ${currentUserPersonalDetails?.status?.text ?? ''}` : '',
    //     pageRoute: ROUTES.SETTINGS_STATUS,
    // },
    // {
    //     description: translate('pronounsPage.pronouns'),
    //     title: getPronouns(),
    //     pageRoute: ROUTES.SETTINGS_PRONOUNS,
    // },
    // {
    //     description: translate('timezonePage.timezone'),
    //     title: currentUserPersonalDetails?.timezone?.selected ?? '',
    //     pageRoute: ROUTES.SETTINGS_TIMEZONE,
    // },
  ];

  // Hooks
  const [displayName, setDisplayName] = useState(
    profileData?.display_name || '',
  );
  // const [name, setName] = useState(profileData?.name || '');
  const [name, setName] = useState('' || '');

  const onSaveChangesPress = async () => {
    Navigation.goBack();
  };

  if (!profileData) {
    return;
  }

  return (
    <ScreenWrapper testID={EditScreen.displayName}>
      <MainHeader
        headerText={translate('profileScreen.editProfile')}
        onGoBack={() => Navigation.goBack()}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        style={styles.pt3}>
        <MenuItemGroup>
          <Section
            title={translate('profileScreen.publicSection.title')}
            subtitle={translate('profileScreen.publicSection.subtitle')}
            isCentralPane
            subtitleMuted
            childrenStyles={styles.pt5}
            titleStyles={styles.accountSettingsSectionTitle}>
            {isLoading ? (
              <FullScreenLoadingIndicator
                style={[
                  styles.flex1,
                  styles.pRelative,
                  StyleUtils.getBackgroundColorStyle(theme.cardBG),
                ]}
              />
            ) : (
              <>
                {publicOptions.map((detail, index) => (
                  <MenuItemWithTopDescription
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${detail.title}_${index}`}
                    shouldShowRightIcon
                    title={detail.title}
                    description={detail.description}
                    wrapperStyle={styles.sectionMenuItemTopDescription}
                    onPress={() => Navigation.navigate(detail.pageRoute)}
                    // brickRoadIndicator={detail.brickRoadIndicator}
                  />
                ))}
              </>
            )}
          </Section>
        </MenuItemGroup>
      </ScrollView>
      <View style={localStyles.saveChangesContainer}>
        <BasicButton
          text="Save Changes"
          buttonStyle={localStyles.saveChangesButton}
          textStyle={localStyles.saveChangesButtonText}
          onPress={onSaveChangesPress}
        />
      </View>
    </ScreenWrapper>
  );
}

const localStyles = StyleSheet.create({
  saveChangesContainer: {
    width: '100%',
    height: 70,
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFFF99',
    padding: 5,
    paddingBottom: 10,
  },
  saveChangesButton: {
    width: '50%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fcf50f',
    // backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 8,
  },
  saveChangesButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  feedbackWindowText: {
    height: '100%',
    width: '100%',
    flexGrow: 1,
    flexShrink: 1,
    textAlignVertical: 'top',
    margin: 12,
    color: 'black',
  },
});

EditScreen.displayName = 'Profile Edit Screen';
export default EditScreen;
