import { StyleSheet, Text, View } from "react-native";

type UserOverviewProps = {
  index: any;
  userId: string;
  RightSideComponent: any // Add the correct type here
}

export const UserOverview = (props: UserOverviewProps) => {
  const { index, userId, RightSideComponent } = props;
  return (
    <View style={styles.userOverviewContainer}>
      <Text style={styles.userText}>{userId}</Text>
      {/* <RightSideComponent/> */}
      {/* <Image></Image> friend icon*/}
      {/* <Text></Text> friend nickname*/}
    </View>
  );
};

export default UserOverview;


const styles = StyleSheet.create({
  userOverviewContainer: {
    width: '80%',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    margin: 2,
    padding: 2,
  },
  userText: {
    color: 'black',
    fontSize: 13,
    fontWeight: '400',
  },
});
