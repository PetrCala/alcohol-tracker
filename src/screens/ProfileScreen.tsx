import {
  StyleSheet,
  View,
} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import commonStyles from '../styles/commonStyles';

import UploadImageComponent from '../components/UploadImage';
import { useFirebase } from '../context/FirebaseContext';
import PermissionHandler from '../permissions/PermissionHandler';

type ProfileProps = {
  navigation: any;
}

const ProfileScreen = (props: ProfileProps) => {
  const { navigation } = props;
  const { db, storage } = useFirebase();

  return (
    <View style={{flex:1, backgroundColor: '#FFFF99'}}>
      <View style={commonStyles.mainHeader}>
        <MenuIcon
          iconId='escape-profile-screen'
          iconSource={require('../../assets/icons/arrow_back.png')}
          containerStyle={styles.backArrowContainer}
          iconStyle={styles.backArrow}
          onPress={() => navigation.goBack() }
        />
      </View>
      <PermissionHandler permissionType='write_photos'>
        <UploadImageComponent
          storage={storage}
        />
      </PermissionHandler>
     </View>
  );
};

export default ProfileScreen;

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
  startSessionButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 50,
    width: 70,
    height: 70,
    backgroundColor: 'green',
    alignItems: 'center',
  },
  startSessionText: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center'
  },
});