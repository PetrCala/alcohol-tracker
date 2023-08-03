import { 
    View,
    Text,
    ActivityIndicator
} from "react-native";
import styles from "../styles";
import { LoadingDataProps } from "../utils/types";

const LoadingData = ({loadingText}:LoadingDataProps) => {
    return (
      <View style={styles.container}>
        <Text>{loadingText}</Text>
        <ActivityIndicator 
          size="large"
          color = "#0000ff"
          />
      </View>
    );
}    

export default LoadingData;