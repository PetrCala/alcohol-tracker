import { 
    View,
    ActivityIndicator,
    StyleSheet
} from "react-native";
import { LoadingDataProps } from "../types/components";

const LoadingData = ({loadingText}:LoadingDataProps) => {
    return (
      <View style={styles.loadingContainer}>
        {/* <Text>{loadingText}</Text> */}
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