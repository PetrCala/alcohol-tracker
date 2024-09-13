import BasicButton from '@components/Buttons/BasicButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import MainHeader from '@components/Header/MainHeader';
import LoadingData from '@components/LoadingData';
import MenuItemGroup from '@components/MenuItemGroup';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Section from '@components/Section';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import {useFirebase} from '@context/global/FirebaseContext';
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

type EditScreenProps = StackScreenProps<
  ProfileNavigatorParamList,
  typeof SCREENS.PROFILE.EDIT
>;

function EditScreen({route}: EditScreenProps) {
  const theme = useTheme();
  const styles = useThemeStyles();
  const StyleUtils = useStyleUtils();
  const {translate} = useLocalize();
  const {auth} = useFirebase();
  const user = auth.currentUser;
  const {userData, isLoading} = useDatabaseData();
  const profileData = userData?.profile;

  const generalOptions = [
    {
      description: 'Name',
      title: 'test',
      pageRoute: ROUTES.HOME,
    },
    {
      description: 'Display name',
      title: profileData?.display_name ?? '',
      pageRoute: ROUTES.HOME,
    },
    {
      description: 'Email',
      title: user?.email ?? '',
      pageRoute: ROUTES.HOME,
    },
    {
      description: 'Password',
      title: '********',
      pageRoute: ROUTES.HOME,
    },
    {
      description: translate('timezoneScreen.timezone'),
      title: userData?.private_data?.timezone ?? '',
      pageRoute: ROUTES.HOME,
    },
    // {
    //     description: translate('timezonePage.timezone'),
    //     title: currentUserPersonalDetails?.timezone?.selected ?? '',
    //     pageRoute: ROUTES.SETTINGS_TIMEZONE,
    // },
  ];

  const personalDetails = [
    {
      description: 'Date of birth',
      title: 'test',
      pageRoute: ROUTES.HOME,
    },
    {
      description: 'Gender',
      title: 'test',
      pageRoute: ROUTES.HOME,
    },
    {
      description: 'Weight',
      title: 'test',
      pageRoute: ROUTES.HOME,
    },
  ];

  // Hooks
  const [displayName, setDisplayName] = useState(
    profileData?.display_name || '',
  );
  // const [name, setName] = useState(profileData?.name || '');
  const [name, setName] = useState('' || '');

  return (
    <ScreenWrapper
      testID={EditScreen.displayName}
      includeSafeAreaPaddingBottom={false}
      shouldShowOfflineIndicatorInWideScreen>
      <MainHeader
        headerText={translate('editProfileScreen.title')}
        onGoBack={() => Navigation.goBack()}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        style={styles.pt3}>
        <MenuItemGroup>
          <Section
            title={translate('editProfileScreen.generalOptions.title')}
            isCentralPane
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
                {generalOptions.map((detail, index) => (
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
          <Section
            title={translate('editProfileScreen.personalDetails.title')}
            subtitle={translate('editProfileScreen.personalDetails.subtitle')}
            isCentralPane
            subtitleMuted
            childrenStyles={styles.pt3}
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
                {personalDetails.map((detail, index) => (
                  <MenuItemWithTopDescription
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${detail.title}_${index}`}
                    shouldShowRightIcon
                    title={detail.title}
                    description={detail.description}
                    wrapperStyle={styles.sectionMenuItemTopDescription}
                    onPress={() => Navigation.navigate(detail.pageRoute)}
                  />
                ))}
              </>
            )}
          </Section>
        </MenuItemGroup>
      </ScrollView>
    </ScreenWrapper>
  );
}

EditScreen.displayName = 'Profile Edit Screen';
export default EditScreen;
