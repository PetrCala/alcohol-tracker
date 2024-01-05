import {View, ActivityIndicator, StyleSheet, Text} from 'react-native';

export type LoadingDataProps = {
  loadingText?: string;
  style?: any;
};

const LoadingData = ({loadingText, style}: LoadingDataProps) => {
  return (
    <View style={styles.loadingContainer}>
      {loadingText ? (
        <Text style={styles.loadingText}>{loadingText}</Text>
      ) : (
        <></>
      )}
      <ActivityIndicator
        size="large"
        color="#0000ff"
        style={style ? style : {}}
      />
    </View>
  );
};

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
