import React, {useEffect, useState} from 'react';
import type {ImageSourcePropType} from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Keyboard,
} from 'react-native';
import * as KirokuIcons from '@components/Icon/KirokuIcons';
import YesNoPopup from '@components/Popups/YesNoPopup';
import type {UserCredential} from 'firebase/auth';
import {deleteUser, signOut} from 'firebase/auth';
import {version as _version} from '../../../package.json';
import {deleteUserData, reauthentificateUser} from '@database/users';
import FeedbackPopup from '@components/Popups/FeedbackPopup';
import {submitFeedback} from '@database/feedback';
import AdminFeedbackPopup from '@components/Popups/AdminFeedbackPopup';
import {listenForDataChanges} from '@database/baseFunctions';
import InputTextPopup from '@components/Popups/InputTextPopup';
import UserOffline from '@components/UserOffline';
import {useUserConnection} from '@context/global/UserConnectionContext';
import ItemListPopup from '@components/Popups/ItemListPopup';
import {useFirebase} from '@context/global/FirebaseContext';
import MainHeader from '@components/Header/MainHeader';
import GrayHeader from '@components/Header/GrayHeader';
import type {FeedbackList} from '@src/types/onyx';
import type {StackScreenProps} from '@react-navigation/stack';
import type {MainMenuNavigatorParamList} from '@navigation/types';
import type SCREENS from '@src/SCREENS';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';
import {useDatabaseData} from '@context/global/DatabaseDataContext';
import ScreenWrapper from '@components/ScreenWrapper';
import LoadingData from '@components/LoadingData';
import useLocalize from '@hooks/useLocalize';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';

type MainMenuButtonData = {
  label: string;
  icon: ImageSourcePropType;
  action: () => void;
};

type MainMenuItemProps = {
  heading: string;
  data: MainMenuButtonData[];
  index: number;
};

const MenuItem: React.FC<MainMenuItemProps> = ({heading, data, index}) => (
  <View key={index} style={{backgroundColor: '#FFFF99'}}>
    <GrayHeader headerText={heading} />
    {data.map((button, bIndex) => (
      <TouchableOpacity
        accessibilityRole="button"
        key={bIndex}
        style={styles.button}
        onPress={button.action}>
        <Image source={button.icon} style={styles.icon} />
        <Text style={styles.buttonText}>{button.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

type MainMenuScreenOnyxProps = {
  pushNotificationsEnabled: OnyxEntry<boolean>;
};

type MainMenuScreenProps = MainMenuScreenOnyxProps &
  StackScreenProps<MainMenuNavigatorParamList, typeof SCREENS.MAIN_MENU.ROOT>;

function MainMenuScreen({route}: MainMenuScreenProps) {
  const {userData, preferences} = useDatabaseData();
  // Context, database, and authentification
  const [pushNotificationsEnabled] = useOnyx(
    ONYXKEYS.PUSH_NOTIFICATIONS_ENABLED,
  );
  const {auth, db} = useFirebase();
  const user = auth.currentUser;
  const {isOnline} = useUserConnection();
  const {translate} = useLocalize();

  // Hooks
  const [FeedbackList, setFeedbackList] = useState<FeedbackList>({});
  // Modals
  const [policiesModalVisible, setPoliciesModalVisible] =
    useState<boolean>(false);
  const [reportBugModalVisible, setReportBugModalVisible] =
    useState<boolean>(false);
  const [feedbackModalVisible, setFeedbackModalVisible] =
    useState<boolean>(false);
  const [signoutModalVisible, setSignoutModalVisible] =
    useState<boolean>(false);
  const [deleteUserModalVisible, setDeleteUserModalVisible] =
    useState<boolean>(false);
  const [reauthentificateModalVisible, setReauthentificateModalVisible] =
    useState<boolean>(false);
  const [adminFeedbackModalVisible, setAdminFeedbackModalVisible] =
    useState<boolean>(false);
  const [deletingUser, setDeletingUser] = useState<boolean>(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      Alert.alert(
        'User sign out error',
        'There was an error signing out: ' + error.message,
      );
    }
  };

  const handleDeleteUser = async (password: string) => {
    if (!db || !userData || !user) {
      return;
    }

    // Reauthentificate the user
    let authentificationResult: void | UserCredential;
    try {
      authentificationResult = await reauthentificateUser(user, password);
    } catch (error: any) {
      Alert.alert(
        'Reauthentification failed',
        'Failed to reauthentificate this user',
      );
      return null;
    }
    if (!authentificationResult) {
      return null; // Cancel user deletion
    }
    // Delete the user's information from the realtime database
    try {
      setDeletingUser(true);
      const userNickname = userData.profile.display_name;
      await deleteUserData(
        db,
        user.uid,
        userNickname,
        userData.friends,
        userData.friend_requests,
      );
    } catch (error: any) {
      handleInvalidDeleteUser(error);
      setDeletingUser(false);
      return;
    }
    // Delete user from authentification database
    try {
      await deleteUser(user);
    } catch (error: any) {
      handleInvalidDeleteUser(error);
      return;
    } finally {
      setDeletingUser(false);
    }
    // Updating the loading state here might cause some issues
    handleSignOut();
    // Add an alert here informing about the user deletion
    Navigation.navigate(ROUTES.SIGNUP);
  };

  /** Handle cases when deleting a user fails */
  const handleInvalidDeleteUser = (error: any) => {
    if (!user) {
      return null;
    }
    const err = error.message;
    if (err.includes('auth/requires-recent-login')) {
      // Should never happen
      Alert.alert(
        'User deletion failed',
        'Recent user authentification was not done, yet the application attempted to delete the user:' +
          error.message,
      );
    } else {
      Alert.alert(
        'Error deleting user',
        'Could not delete user ' + user.uid + error.message,
      );
    }
    return null;
  };

  const handleSubmitReportBug = () => {
    // Popup an information button at the top (your feedback has been submitted)
    setReportBugModalVisible(false);
  };

  const handleSubmitFeedback = (feedback: string) => {
    if (!db || !user) {
      return;
    }
    if (feedback !== '') {
      submitFeedback(db, user.uid, feedback);
      // Popup an information button at the top (your feedback has been submitted)
      setFeedbackModalVisible(false);
    } // Perhaps alert the user that they must fill out the feedback first
  };

  const handleConfirmSignout = () => {
    handleSignOut(); // Automatically sets the navigation to public screens
    setSignoutModalVisible(false);
  };

  const handleConfirmDeleteUser = () => {
    setDeleteUserModalVisible(false);
    setReauthentificateModalVisible(true);
  };

  const onProfileButtonPress = () => {
    if (!user) {
      return;
    }
    Navigation.navigate(ROUTES.PROFILE_EDIT.getRoute(user.uid));
  };

  // Monitor feedback data
  if (userData?.role == 'admin') {
    useEffect(() => {
      if (!db) {
        return;
      }
      // Start listening for changes when the component mounts
      const dbRef = `feedback/`;
      const stopListening = listenForDataChanges(
        db,
        dbRef,
        (data: FeedbackList) => {
          if (data != null) {
            setFeedbackList(data);
          }
        },
      );

      // Stop listening for changes when the component unmounts
      return () => {
        stopListening();
      };
    }, [db, user]);
  }

  let modalData = [
    {
      heading: 'Your account',
      data: [
        // {
        //     label: 'Settings',
        //     icon: KirokuIcons.Settings,
        //     action: () => navigation.navigate("Settings Screen")
        // },
        {
          label: 'Profile',
          icon: KirokuIcons.UserIcon,
          action: () => onProfileButtonPress(),
        },
        {
          label: 'Preferences',
          icon: KirokuIcons.Settings,
          action: () => Navigation.navigate(ROUTES.MAIN_MENU_PREFERENCES),
        },
      ],
    },
    {
      heading: 'General',
      data: [
        {
          label: 'Legal and Policies',
          icon: KirokuIcons.Book,
          action: () => setPoliciesModalVisible(true),
        },
        //   label: 'Report a bug',
        //   icon: KirokuIcons.Bug,
        //   action: () => console.log('Bug reporting'),
        // },
        {
          label: 'Give us a feedback',
          icon: KirokuIcons.Idea,
          action: () => setFeedbackModalVisible(true),
        },
        {
          label: 'Share the app',
          icon: KirokuIcons.Share,
          action: () => Navigation.navigate(ROUTES.MAIN_MENU_APP_SHARE),
        },
      ],
    },
    {
      heading: 'Authentification',
      data: [
        {
          label: 'Sign out',
          icon: KirokuIcons.Exit,
          action: () => setSignoutModalVisible(true),
        },
        {
          label: 'Delete user',
          icon: KirokuIcons.Delete,
          action: () => setDeleteUserModalVisible(true),
        },
      ],
    },
  ];

  const adminData = [
    {
      heading: 'Admin settings',
      data: [
        {
          label: 'See feedback',
          icon: KirokuIcons.Book,
          action: () => {
            setAdminFeedbackModalVisible(true);
          },
        },
      ],
    },
  ];

  const policiesData = [
    {
      label: 'Terms of service',
      icon: KirokuIcons.Book,
      action: () => {
        Navigation.navigate(ROUTES.MAIN_MENU_POLICIES_TERMS_OF_SERVICE);
        setPoliciesModalVisible(false);
      },
    },
    {
      label: 'Privacy Policy',
      icon: KirokuIcons.Book,
      action: () => {
        Navigation.navigate(ROUTES.MAIN_MENU_POLICIES_PRIVACY_POLICY);
        setPoliciesModalVisible(false);
      },
    },
  ];

  if (userData?.role == 'admin') {
    modalData = [...modalData, ...adminData]; // Add admin settings
  }

  if (!isOnline) {
    return <UserOffline />;
  }
  if (deletingUser) {
    return <LoadingData loadingText="Deleting your account..." />;
  }
  if (!preferences || !userData || !user) {
    return null;
  }

  return (
    <ScreenWrapper testID={MainMenuScreen.displayName}>
      <View style={styles.mainContainer}>
        <MainHeader headerText="" onGoBack={() => Navigation.goBack()} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          style={styles.scrollView}>
          {modalData.map((group, index) => (
            <MenuItem
              key={index}
              heading={group.heading}
              data={group.data}
              index={index}
            />
          ))}
          <ItemListPopup
            visible={policiesModalVisible}
            transparent={true}
            heading={'Our Policies'}
            actions={policiesData}
            onRequestClose={() => setPoliciesModalVisible(false)}
          />
          <FeedbackPopup
            visible={feedbackModalVisible}
            transparent={true}
            message={translate('mainMenuScreen.improvementThoughts')}
            onRequestClose={() => setFeedbackModalVisible(false)}
            onSubmit={feedback => handleSubmitFeedback(feedback)}
          />
          <YesNoPopup
            visible={signoutModalVisible}
            transparent={true}
            message={'Do you really want to\nsign out?'}
            onRequestClose={() => setSignoutModalVisible(false)}
            onYes={handleConfirmSignout}
          />
          <YesNoPopup
            visible={deleteUserModalVisible}
            transparent={true}
            message={
              'WARNING: Destructive action\n\nDo you really want to\ndelete this user?'
            }
            onRequestClose={() => setDeleteUserModalVisible(false)}
            onYes={handleConfirmDeleteUser}
          />
          <InputTextPopup
            visible={reauthentificateModalVisible}
            transparent={true}
            message={'Please retype your password\nin order to proceed'}
            confirmationMessage={translate('mainMenuScreen.deleteConfirmation')}
            placeholder={translate('common.password')}
            onRequestClose={() => setReauthentificateModalVisible(false)}
            onSubmit={password => handleDeleteUser(password)}
            textContentType="password"
            secureTextEntry
          />
          <AdminFeedbackPopup
            visible={adminFeedbackModalVisible}
            transparent={true}
            onRequestClose={() => setAdminFeedbackModalVisible(false)}
            FeedbackList={FeedbackList}
          />
        </ScrollView>
      </View>
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>{_version}</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollView: {
    width: '100%',
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: '#FFFF99',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    color: 'black',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    margin: 2,
  },
  icon: {
    width: 20,
    height: 20,
  },
  buttonText: {
    marginLeft: 10,
    color: 'black',
    fontSize: 15,
    fontWeight: '500',
  },
  versionContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 'auto',
    height: 'auto',
  },
  versionText: {
    color: 'gray',
    fontSize: 13,
  },
});

// MainMenuScreen.propTypes = propTypes;
// MainMenuScreen.defaultProps = defaultProps;
MainMenuScreen.displayName = 'Main Menu Screen';

export default MainMenuScreen;
