import { 
    View,
    Text,
    ActivityIndicator
} from "react-native";
import styles from "../styles";
import { LoadingDataProps } from "../types/various";

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