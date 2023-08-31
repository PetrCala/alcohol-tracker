import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Image,
  Alert
} from 'react-native';

import { 
    SettingsPopupProps, 
    SettingsItemProps 
} from '../../types/components';
import MenuIcon from '../Buttons/MenuIcon';
import YesNoPopup from './YesNoPopup';
import { deleteUser, getAuth, signOut } from 'firebase/auth';
import DatabaseContext from '../../database/DatabaseContext';
import { deleteUserInfo } from '../../database/users';
import FeedbackPopup from './FeedbackPopup';
import { submitFeedback } from '../../database/feedback';

const SettingsItem: React.FC<SettingsItemProps> = ({
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

const SettingsPopup = (props: SettingsPopupProps) => {
  // Props
  const { visible, transparent, onRequestClose, navigation, userData } = props;
  // Context, database, and authentification
  const auth = getAuth();
  const user = auth.currentUser;
  const db = useContext(DatabaseContext);
  if (!user) return null;
  // Hooks
  const [feedbackText, setFeedbackText] = useState<string>('');
  // Modals
  const [reportBugModalVisible, setReportBugModalVisible] = useState<boolean>(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState<boolean>(false);
  const [signoutModalVisible, setSignoutModalVisible] = useState<boolean>(false);
  const [deleteUserModalVisible, setDeleteUserModalVisible] = useState<boolean>(false);


  const handleSignOut = async () => {
    try {
      // TODO
      // reauthenticateWithCredential
      await signOut(auth);
    } catch (error:any) {
      throw new Error("There was an error signing out: " + error.message);
    }
  };

  const handleDeleteUser = async () => {
    // Delete the user's information from the realtime database
    try {
        await deleteUserInfo(db, user.uid);
    } catch (error:any) {
      return Alert.alert('Could not delete user info from database', 'Deleting the users info from realtime database failed: ' + error.message);
    }
    // Delete user from authentification database
    try {
      await deleteUser(user);
    } catch (error:any) {
        return Alert.alert('Error deleting user', 'Could not delete user ' + user.uid + error.message);
    }
    navigation.replace("Login Screen");
  };

  const handleSubmitReportBug = () => {
    // Popup an information button at the top (your feedback has been submitted)
    setReportBugModalVisible(false);
  };

  const handleCancelReportBug = () => {
    setReportBugModalVisible(false);
  };

  const handleSubmitFeedback = () => {
    if (feedbackText !== ''){
        submitFeedback(db, user.uid, feedbackText);
        // Popup an information button at the top (your feedback has been submitted)
        setFeedbackText('');
        setFeedbackModalVisible(false);
    }; // Perhaps alert the user that they must fill out the feedback first
  };

  const handleCancelFeedback = () => {
    setFeedbackText('');
    setFeedbackModalVisible(false);
  };

  const handleConfirmSignout = () => {
    handleSignOut();
    setSignoutModalVisible(false);
    navigation.replace("Login Screen");
  };

  const handleCancelSignout = () => {
    setSignoutModalVisible(false);
  };

  const handleConfirmDeleteUser = () => {
    handleDeleteUser();
    setDeleteUserModalVisible(false);
    navigation.replace("Login Screen");
  };

  const handleCancelDeleteUser = () => {
    setDeleteUserModalVisible(false);
  };


  let modalData = [
    { heading: 'General', data:[
        { 
            label: 'Settings', 
            icon: require('../../assets/icons/settings.png'), 
            action: () => console.log('Beer pressed') 
        },
        { 
            label: 'Terms and agreements', 
            icon: require('../../assets/icons/book.png'), 
            action: () => {}
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
                action: () => {console.log("viewing feedback...")}
            },
        ]},
    ];

  if (userData.role == 'admin'){
    modalData = [...modalData, ...adminData] // Add admin settings
  };

  return (
    <Modal
      animationType="slide"
      transparent={transparent}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.mainHeader}>
            <MenuIcon
                iconId='escape-settings-screen'
                iconSource={require('../../assets/icons/arrow_back.png')}
                containerStyle={styles.backArrowContainer}
                iconStyle={styles.backArrow}
                onPress={onRequestClose}
            />
        </View>
        <ScrollView style={styles.scrollView}>
            {modalData.map((group, index) => (
                <SettingsItem key={index} heading={group.heading} data={group.data} index={index} />
            ))}
            <FeedbackPopup
                visible={feedbackModalVisible}
                transparent={true}
                onRequestClose={() => setFeedbackModalVisible(false)}
                message={"What would you like us to improve?"}
                setFeedbackText={setFeedbackText}
                onSubmit={handleSubmitFeedback}
                onClose={handleCancelFeedback}
            />
            <YesNoPopup
                visible={signoutModalVisible}
                transparent={true}
                onRequestClose={() => setSignoutModalVisible(false)}
                message={"Do you really want to\nsign out?"}
                onYes={handleConfirmSignout}
                onNo={handleCancelSignout}
            />
            <YesNoPopup
                visible={deleteUserModalVisible}
                transparent={true}
                onRequestClose={() => setDeleteUserModalVisible(false)}
                message={"WARNING: Destructive action\n\nDo you really want to\ndelete this user?"}
                onYes={handleConfirmDeleteUser}
                onNo={handleCancelDeleteUser}
            />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    mainHeader: {
        height: 70,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center',
        padding: 10,
        backgroundColor: 'white',
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
      margin: 5,
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
      fontWeight: 'bold',
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

export default SettingsPopup;
