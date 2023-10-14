import { StyleSheet, Text, View } from "react-native";

type UserOverviewProps = {
  index: any;
  userId: string;
}

export const UserOverview = (props: UserOverviewProps) => {
  const { index, userId } = props;

  return (
    <View style={styles.userOverviewContainer}>
      <Text key={index} style={styles.userText}>{userId}</Text>
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
