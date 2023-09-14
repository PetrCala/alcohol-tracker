import { 
    View,
    StyleSheet,
    Text,
} from "react-native";

const UserOffline = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>You are offline</Text>
      </View>
    );
}    

export default UserOffline;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFF99',
  },
  text: {
    fontSize: 40,
    color: 'black',
  }
});