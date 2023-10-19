import { getAuth } from "firebase/auth";
import { StyleSheet, Text, View } from "react-native";
import { useFirebase } from "../context/FirebaseContext";
import { ProfileData } from "../types/database";
import ProfileImage from "./ProfileImage";


type UserOverviewProps = {
  userId: string; // Other user's ID
  profileData: ProfileData;
  RightSideComponent: React.FC 
};


const UserOverview: React.FC<UserOverviewProps> = ({
  userId,
  profileData,
  RightSideComponent
}) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const { db, storage } = useFirebase();

  // const handleAcceptFriendRequest = async (db:Database, userId:string, requestId: string):Promise<void> => {
  //   try {
  //     await acceptFriendRequest(db, userId, requestId);
  //   } catch (error:any){
  //     Alert.alert("Friend request accept failed", "Could not accept the friend request: " + error.message);
  //   };
  // };

  // const handleRejectFriendRequest = async (db:Database, userId:string, requestId: string):Promise<void> => {
  //   try {
  //     await deleteFriendRequest(db, userId, requestId);
  //   } catch (error:any){
  //     Alert.alert("Friend request accept failed", "Could not accept the friend request: " + error.message);
  //   };
  // };

  if (!db || !user || !profileData) return;

  return (
    <View key={userId+'-container'} style={styles.userOverviewContainer}>
      <View key={userId+'profile'} style={styles.userOverviewProfile}>
        <ProfileImage
          key={userId+'-profile-icon'}
          storage={storage}
          userId={userId}
          photoURL={profileData.photo_url}
          style={styles.userOverviewImage}
        />
        <Text key={userId+'-nickname'} style={styles.userOverviewText}>{profileData.display_name}</Text>
      </View>
      <RightSideComponent/>
      {/* {requestStatus === 'received' ?
      <FriendRequestButtons key={userId+'-friend-request-buttons'}/>
      : requestStatus === 'sent' ?
      <FriendRequestPending key={userId+'-friend-request-pending'}/>
      : 
      <></>
      } */}
    </View>
  );
};

export default UserOverview;


const styles = StyleSheet.create({
  userOverviewContainer: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 5,
  },
  userOverviewProfile: {
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 5,
    paddingTop: 7
  },
  userOverviewImage: {
    width: 70,
    height: 70,
    padding: 10,
    borderRadius: 35,
  },
  userOverviewText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
    marginLeft: 10,
  },
});
