import {Dimensions, ScrollView, StyleSheet, Text, View} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import commonStyles from '../styles/commonStyles';

import UploadImageComponent from '../components/UploadImage';
import {useFirebase} from '../context/FirebaseContext';
import PermissionHandler from '../permissions/PermissionHandler';
import {ProfileProps} from '@src/types/screens';
import ProfileImage from '@components/ProfileImage';

const ProfileScreen = ({route, navigation}: ProfileProps) => {
  if (!route || !navigation) return null;
  const {userId} = route.params;

  const {db, storage} = useFirebase();

  return (
    <View style={{flex: 1, backgroundColor: '#FFFF99'}}>
      <View style={commonStyles.mainHeader}>
        <MenuIcon
          iconId="escape-profile-screen"
          iconSource={require('../../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack()}
        />
      </View>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.profileImageContainer}>
          <ProfileImage
            storage={storage}
            userId={userId}
            // photoURL={profileData.photo_url}
            photoURL=""
            style={styles.profileImage}
          />
        </View>
        
      </ScrollView>
    </View>
  );
};

{/* <PermissionHandler permissionType="write_photos">
  <UploadImageComponent storage={storage} />
</PermissionHandler> */}

export default ProfileScreen;

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  backArrowContainer: {
    justifyContent: 'center',
    marginTop: 10,
    marginLeft: 10,
    padding: 10,
    position: 'absolute',
  },
  backArrow: {
    width: 25,
    height: 25,
  },
  scrollView: {
    width: '100%',
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: '#FFFF99',
  },
  profileImageContainer: {
    backgroundColor: 'white',
    width: '100%',
    height: 120,
  },
  profileImage: {
    width: 70,
    height: 70,
    padding: 10,
    borderRadius: 35,
  },
});
