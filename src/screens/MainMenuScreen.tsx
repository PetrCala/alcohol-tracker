import React, { useContext, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Image,
  Alert
} from 'react-native';

import { 
    MainMenuItemProps 
} from '../types/components';
import MenuIcon from '../components/Buttons/MenuIcon';
import YesNoPopup from '../components/Popups/YesNoPopup';
import { EmailAuthProvider, UserCredential, deleteUser, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { auth } from "../../src/services/firebaseConfig";
import { deleteUserInfo, reauthentificateUser } from '../database/users';
import FeedbackPopup from '../components/Popups/FeedbackPopup';
import { submitFeedback } from '../database/feedback';
import { MainMenuScreenProps } from '../types/screens';
import AdminFeedbackPopup from '../components/Popups/AdminFeedbackPopup';
import { FeedbackData } from '../types/database';
import { listenForDataChanges, readDataOnce } from '../database/baseFunctions';
import InputTextPopup from '../components/Popups/InputTextPopup';
import UserOffline from '../components/UserOffline';
import { useUserConnection } from '../context/UserConnectionContext';
import { getDatabaseData } from '../context/DatabaseDataContext';
import ItemListPopup from '../components/Popups/ItemListPopup';
import commonStyles from '../styles/commonStyles';
import { useFirebase } from '../context/FirebaseContext';

const MenuItem: React.FC<MainMenuItemProps> = ({
    heading,
    data,
    index
  }) => (
    <View key={index}>
    <View style={styles.groupMarker}>
        <Text style={styles.groupText}>{heading}</Text>
    </View>
    {data.map((button, bIndex) => (
        <TouchableOpacity key={bIndex} style={styles.button} onPress={button.action}>
            <Image source={button.icon} style={styles.icon} />
            <Text style={styles.buttonText}>{button.label}</Text>
        </TouchableOpacity>
    ))}
    </View>
);

const MainMenuScreen = ({ route, navigation}: MainMenuScreenProps) => {
  if (!route || !navigation) return null; // Should never be null
  const { userData, preferences } = getDatabaseData();
  // Context, database, and authentification
  const user = auth.currentUser;
  const { db } = useFirebase();
  const { isOnline } = useUserConnection();
  if (!user) return null;
  // Hooks
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({});
  // Modals
  const [policiesModalVisible, setPoliciesModalVisible] = useState<boolean>(false);
  const [reportBugModalVisible, setReportBugModalVisible] = useState<boolean>(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState<boolean>(false);
  const [signoutModalVisible, setSignoutModalVisible] = useState<boolean>(false);
  const [deleteUserModalVisible, setDeleteUserModalVisible] = useState<boolean>(false);
  const [reauthentificateModalVisible, setReauthentificateModalVisible] = useState<boolean>(false);
  const [adminFeedbackModalVisible, setAdminFeedbackModalVisible] = useState<boolean>(false);

  const handleSignOut = async () => {
    try {
      // TODO
      // reauthenticateWithCredential
      await signOut(auth);
    } catch (error:any) {
      Alert.alert("User sign out error", "There was an error signing out: " + error.message);
      return null;
    }
  };

  const handleDeleteUser = async (password:string) => {
    if (!db || !userData) return;
    // Reauthentificate the user
    let authentificationResult:void|UserCredential;
    try {
      authentificationResult = await reauthentificateUser(user, password);
    } catch (error:any){
      Alert.alert("Reauthentification failed", "Failed to reauthentificate this user");
      return null;
    };
    if (!authentificationResult){
      return null; // Cancel user deletion
    };
    // Delete the user's information from the realtime database
    try {
        let userNickname = userData.profile.display_name;
        await deleteUserInfo(db, user.uid, userNickname, userData.beta_key_id); // Beta feature
    } catch (error:any) {
      handleInvalidDeleteUser(error);
    }
    // Delete user from authentification database
    try {
      await deleteUser(user);
    } catch (error:any) {
      handleInvalidDeleteUser(error);
    }
    handleSignOut() // Sign out the user
    // Add an alert here informing about the user deletion
    navigation.replace("Auth", {screen: "Login Screen"});
  };

  /** Handle cases when deleting a user fails */
  const handleInvalidDeleteUser = (error:any) => {
    var err = error.message;
    if (err.includes('auth/requires-recent-login')){
      // Should never happen
      Alert.alert('User deletion failed', 'Recent user authentification was not done, yet the application attempted to delete the user:' + error.message);
    } else {
      Alert.alert('Error deleting user', 'Could not delete user ' + user.uid + error.message);
    }
    return null;
  };

  const handleSubmitReportBug = () => {
    // Popup an information button at the top (your feedback has been submitted)
    setReportBugModalVisible(false);
  };

  const handleSubmitFeedback = (feedback: string) => {
    if (!db) return;
    if (feedback !== ''){
        submitFeedback(db, user.uid, feedback);
        // Popup an information button at the top (your feedback has been submitted)
        setFeedbackModalVisible(false);
    }; // Perhaps alert the user that they must fill out the feedback first
  };

  const handleConfirmSignout = () => {
    handleSignOut();
    setSignoutModalVisible(false);
    navigation.replace("Auth", {screen: "Login Screen"});
  };

  const handleConfirmDeleteUser = () => {
    setDeleteUserModalVisible(false);
    setReauthentificateModalVisible(true);
  };

  // Monitor feedback data
  if (userData?.role == 'admin'){
    useEffect(() => {
        if (!db) return;
        // Start listening for changes when the component mounts
        let dbRef = `feedback/`
        let stopListening = listenForDataChanges(db, dbRef, (data: FeedbackData) => {
          if (data != null) {
          setFeedbackData(data);
        };
      });
      
      // Stop listening for changes when the component unmounts
      return () => {
        stopListening();
      };
      
    }, [db, user]); 
  };

  let modalData = [
    { heading: 'General', data:[
        // { 
        //     label: 'Settings', 
        //     icon: require('../../assets/icons/settings.png'), 
        //     action: () => navigation.navigate("Settings Screen")
        // },
        { 
            label: 'Preferences', 
            icon: require('../../assets/icons/settings.png'), 
            action: () => navigation.navigate("Preferences Screen"),
        },
        { 
            label: 'Legal and Policies', 
            icon: require('../../assets/icons/book.png'), 
            action: () => setPoliciesModalVisible(true),
        },
    ]},
    { heading: 'Feedback', data:[
        { 
            label: 'Report a bug', 
            icon: require('../../assets/icons/bug.png'), 
            action: () => console.log('Bug reporting') // Throw an information window - not yet implemented
        },
        { 
            label: 'Give us a feedback', 
            icon: require('../../assets/icons/idea.png'), 
            action: () => setFeedbackModalVisible(true)
        },
    ]},
    { heading: 'Authentification', data:[
        { 
            label: 'Sign out', 
            icon: require('../../assets/icons/exit.png'), 
            action: () => setSignoutModalVisible(true)
        },
        { 
            label: 'Delete user', 
            icon: require('../../assets/icons/delete.png'), 
            action: () => setDeleteUserModalVisible(true)
        },
    ]},
    ];

    let adminData = [
        {heading: 'Admin settings', data:[
            { 
                label: 'See feedback', 
                icon: require('../../assets/icons/book.png'), 
                action: () => {setAdminFeedbackModalVisible(true)}
            },
        ]},
    ];

    let policiesData = [
        { 
            label: 'Terms of service', 
            icon: require('../../assets/icons/book.png'), 
            action: () => {
              navigation.navigate("Terms Of Service Screen")
              setPoliciesModalVisible(false)
            }
        },
        { 
            label: 'Privacy Policy', 
            icon: require('../../assets/icons/book.png'), 
            action: () => {
              navigation.navigate("Privacy Policy Screen")
              setPoliciesModalVisible(false)
          }
        },
    ]

  if (userData?.role == 'admin'){
    modalData = [...modalData, ...adminData] // Add admin settings
  };

  if (!isOnline) return (<UserOffline/>);
  if (!db || !preferences || !userData) return null; // Should never be null

  return (
      <View style={styles.mainContainer}>
        <View style={commonStyles.mainHeader}>
            <MenuIcon
                iconId='escape-main-menu'
                iconSource={require('../../assets/icons/arrow_back.png')}
                containerStyle={styles.backArrowContainer}
                iconStyle={styles.backArrow}
                onPress= {() => navigation.goBack()}
            />
        </View>
        <ScrollView style={styles.scrollView}>
            {modalData.map((group, index) => (
                <MenuItem key={index} heading={group.heading} data={group.data} index={index} />
            ))}
            <ItemListPopup
                visible={policiesModalVisible}
                transparent={true}
                heading={"Our Policies"}
                actions={policiesData}
                onRequestClose={() => setPoliciesModalVisible(false)}
            />
            <FeedbackPopup
                visible={feedbackModalVisible}
                transparent={true}
                message={"What would you like us to improve?"}
                onRequestClose={() => setFeedbackModalVisible(false)}
                onSubmit={(feedback) => handleSubmitFeedback(feedback)}
            />
            <YesNoPopup
                visible={signoutModalVisible}
                transparent={true}
                message={"Do you really want to\nsign out?"}
                onRequestClose={() => setSignoutModalVisible(false)}
                onYes={handleConfirmSignout}
            />
            <YesNoPopup
                visible={deleteUserModalVisible}
                transparent={true}
                message={"WARNING: Destructive action\n\nDo you really want to\ndelete this user?"}
                onRequestClose={() => setDeleteUserModalVisible(false)}
                onYes={handleConfirmDeleteUser}
            />
            <InputTextPopup
              visible={reauthentificateModalVisible}
              transparent={true}
              message={"Please retype your password\nin order to proceed"}
              confirmationMessage={"Delete user"}
              placeholder={"Password"}
              onRequestClose={() => setReauthentificateModalVisible(false)}
              onSubmit={(password) => handleDeleteUser(password)}
              textContentType='password'
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
        flexGrow:1, 
        flexShrink: 1,
        backgroundColor: '#FFFF99',
    },
    backArrowContainer: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 10,
    },
    backArrow: {
        width: 25,
        height: 25,
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
      fontSize: 16,
      fontWeight: '500',
    },
    groupMarker: {
      width: '100%',
      padding: 10,
      backgroundColor: 'gray',
    },
    groupText: {
      color: 'white',
      fontWeight: 'bold',
    },
});
