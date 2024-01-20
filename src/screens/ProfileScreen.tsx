import {Dimensions, ScrollView, StyleSheet, Text, View} from 'react-native';
import MenuIcon from '../components/Buttons/MenuIcon';
import commonStyles from '../styles/commonStyles';

import UploadImageComponent from '../components/UploadImage';
import {useFirebase} from '../context/FirebaseContext';
import PermissionHandler from '../permissions/PermissionHandler';
import {ProfileProps} from '@src/types/screens';
import ProfileImage from '@components/ProfileImage';
import {StatData, StatsOverview} from '@components/Items/StatOverview';
import ProfileOverview from '@components/Social/ProfileOverview';

const ProfileScreen = ({route, navigation}: ProfileProps) => {
  if (!route || !navigation) return null;
  const {userId, profileData} = route.params;

  const {db, storage} = useFirebase();

  // Define your stats data
  const statsData: StatData = [
    {header: 'Drinking Sessions', content: '10'},
    {header: 'Units Consumed', content: '20'},
    {header: 'Points Earned', content: '30'},
  ];

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
        <View style={styles.menuContainer}>
          <Text style={styles.sectionText}>Profile</Text>
        </View>
      </View>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <ProfileOverview
          userId={userId}
          profileData={profileData}
        />
        <View style={styles.horizontalLine} />
        <View style={styles.statsOverviewHolder}>
          <StatsOverview statsData={statsData} />
        </View>
      </ScrollView>
    </View>
  );
};

{
  /* <PermissionHandler permissionType="write_photos">
  <UploadImageComponent storage={storage} />
</PermissionHandler> */
}

export default ProfileScreen;

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const profileImageWidth = 120;

const styles = StyleSheet.create({
  backArrowContainer: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  backArrow: {
    width: 25,
    height: 25,
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 200,
  },
  sectionText: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    margin: 10,
    textAlign: 'center',
  },
  scrollView: {
    width: '100%',
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: '#FFFF99',
  },
  horizontalLine: {
    width: screenWidth * 0.9,
    height: 1,
    backgroundColor: 'grey',
    alignSelf: 'center',
  },
  statsOverviewHolder: {
    height: 120,
    flexDirection: 'row',
    width: screenWidth,
  },
});
