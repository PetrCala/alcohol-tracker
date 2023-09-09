import { 
    View,
    ActivityIndicator,
    StyleSheet,
    Text,
} from "react-native";
import { LoadingDataProps } from "../types/components";

const LoadingData = ({
  loadingText
}:LoadingDataProps) => {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{loadingText}</Text>
        <ActivityIndicator 
          size="large"
          color = "#0000ff"
          />
      </View>
    );
}    

export default LoadingData;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 15,
  },
});