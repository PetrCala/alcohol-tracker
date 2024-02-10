import React, {useContext, useEffect, useState} from 'react';
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

import {MainMenuItemProps} from '../types/components';
import YesNoPopup from '../components/Popups/YesNoPopup';
import {UserCredential, deleteUser, signOut} from 'firebase/auth';
import {auth} from '../services/firebaseSetup';
import {deleteUserData, reauthentificateUser} from '../database/users';
import FeedbackPopup from '../components/Popups/FeedbackPopup';
import {submitFeedback} from '../database/feedback';
import {MainMenuScreenProps} from '../types/screens';
import AdminFeedbackPopup from '../components/Popups/AdminFeedbackPopup';
import {FeedbackData} from '../types/database';
import {listenForDataChanges, readDataOnce} from '../database/baseFunctions';
import InputTextPopup from '../components/Popups/InputTextPopup';
import UserOffline from '../components/UserOffline';
import {useUserConnection} from '../context/global/UserConnectionContext';
import {getDatabaseData} from '../context/global/DatabaseDataContext';
import ItemListPopup from '../components/Popups/ItemListPopup';
import {useFirebase} from '../context/global/FirebaseContext';
import MainHeader from '@components/Header/MainHeader';
import GrayHeader from '@components/Header/GrayHeader';
import DismissKeyboard from '@components/Keyboard/DismissKeyboard';
import CONST from '@src/CONST';

const MenuItem: React.FC<MainMenuItemProps> = ({heading, data, index}) => (
  <View key={index}>
    <GrayHeader headerText={heading} />
    {data.map((button, bIndex) => (
      <TouchableOpacity
        key={bIndex}
        style={styles.button}
        onPress={button.action}>
        <Image source={button.icon} style={styles.icon} />
        <Text style={styles.buttonText}>{button.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const MainMenuScreen = ({route, navigation}: MainMenuScreenProps) => {
  const {userData, preferences} = getDatabaseData();
  // Context, database, and authentification
  const user = auth.currentUser;
  const {db} = useFirebase();
  const {isOnline} = useUserConnection();
  if (!user) return null;
  // Hooks
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({});
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
    if (!db || !userData) return;
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
      let userNickname = userData.profile.display_name;
      await deleteUserData(
        db,
        user.uid,
        userNickname,
        userData.beta_key_id,
        userData.friends,
        userData.friend_requests,
      ); // Beta feature
    } catch (error: any) {
      handleInvalidDeleteUser(error);
    }
    // Delete user from authentification database
    try {
      await deleteUser(user);
    } catch (error: any) {
      handleInvalidDeleteUser(error);
    }
    handleSignOut(); // Sign out the user
    // Add an alert here informing about the user deletion
    navigation.navigate('Auth', {screen: 'Login Screen'});
  };

  /** Handle cases when deleting a user fails */
  const handleInvalidDeleteUser = (error: any) => {
    var err = error.message;
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
    if (!db) return;
    if (feedback !== '') {
      submitFeedback(db, user.uid, feedback);
      // Popup an information button at the top (your feedback has been submitted)
      setFeedbackModalVisible(false);
    } // Perhaps alert the user that they must fill out the feedback first
  };

  const handleConfirmSignout = () => {
    handleSignOut();
    setSignoutModalVisible(false);
    navigation.navigate('Auth', {screen: 'Login Screen'});
  };

  const handleConfirmDeleteUser = () => {
    setDeleteUserModalVisible(false);
    setReauthentificateModalVisible(true);
  };

  // Monitor feedback data
  if (userData?.role == 'admin') {
    useEffect(() => {
      if (!db) return;
      // Start listening for changes when the component mounts
      let dbRef = `feedback/`;
      let stopListening = listenForDataChanges(
        db,
        dbRef,
        (data: FeedbackData) => {
          if (data != null) {
            setFeedbackData(data);
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
      heading: 'General',
      data: [
        // {
        //     label: 'Settings',
        //     icon: CONST.ICONS.SETTINGS,
        //     action: () => navigation.navigate("Settings Screen")
        // },
        {
          label: 'Preferences',
          icon: CONST.ICONS.SETTINGS,
          action: () => navigation.navigate('Preferences Screen'),
        },
        {
          label: 'Legal and Policies',
          icon: CONST.ICONS.BOOK,
          action: () => setPoliciesModalVisible(true),
        },
      ],
    },
    {
      heading: 'Feedback',
      data: [
        // {
        //   label: 'Report a bug',
        //   icon: CONST.ICONS.BUG,
        //   action: () => console.log('Bug reporting'),
        // },
        {
          label: 'Give us a feedback',
          icon: CONST.ICONS.IDEA,
          action: () => setFeedbackModalVisible(true),
        },
      ],
    },
    {
      heading: 'Authentification',
      data: [
        {
          label: 'Sign out',
          icon: CONST.ICONS.EXIT,
          action: () => setSignoutModalVisible(true),
        },
        {
          label: 'Delete user',
          icon: CONST.ICONS.DELETE,
          action: () => setDeleteUserModalVisible(true),
        },
      ],
    },
  ];

  let adminData = [
    {
      heading: 'Admin settings',
      data: [
        {
          label: 'See feedback',
          icon: CONST.ICONS.BOOK,
          action: () => {
            setAdminFeedbackModalVisible(true);
          },
        },
      ],
    },
  ];

  let policiesData = [
    {
      label: 'Terms of service',
      icon: CONST.ICONS.BOOK,
      action: () => {
        navigation.navigate('Terms Of Service Screen');
        setPoliciesModalVisible(false);
      },
    },
    {
      label: 'Privacy Policy',
      icon: CONST.ICONS.BOOK,
      action: () => {
        navigation.navigate('Privacy Policy Screen');
        setPoliciesModalVisible(false);
      },
    },
  ];

  if (userData?.role == 'admin') {
    modalData = [...modalData, ...adminData]; // Add admin settings
  }

  if (!route || !navigation) return null; // Should never be null
  if (!isOnline) return <UserOffline />;
  if (!db || !preferences || !userData) return null; // Should never be null

  return (
    <DismissKeyboard>
      <View style={styles.mainContainer}>
        <MainHeader headerText="" onGoBack={() => navigation.goBack()} />
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
            message={'What would you like us to improve?'}
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
            confirmationMessage={'Delete user'}
            placeholder={'Password'}
            onRequestClose={() => setReauthentificateModalVisible(false)}
            onSubmit={password => handleDeleteUser(password)}
            textContentType="password"
            secureTextEntry
          />
          <AdminFeedbackPopup
            visible={adminFeedbackModalVisible}
            transparent={true}
            onRequestClose={() => setAdminFeedbackModalVisible(false)}
            feedbackData={feedbackData}
          />
        </ScrollView>
      </View>
    </DismissKeyboard>
  );
};

export default MainMenuScreen;

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
    width: 15,
    height: 15,
    padding: 10,
  },
  buttonText: {
    marginLeft: 10,
    color: 'black',
    fontSize: 15,
    fontWeight: '500',
  },
});
