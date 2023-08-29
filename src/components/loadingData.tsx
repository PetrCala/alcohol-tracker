import { 
    View,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { LoadingDataProps } from "../types/components";

const LoadingData = ({}:LoadingDataProps) => {
    return (
      <View style={styles.loadingContainer}>
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
});