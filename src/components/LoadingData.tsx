import {View, ActivityIndicator, StyleSheet, Text} from 'react-native';

export type LoadingDataProps = {
  loadingText?: string;
  style?: any;
  backgroundColor?: any;
};

const LoadingData = ({
  loadingText,
  style,
  backgroundColor,
}: LoadingDataProps) => {
  return (
    <View
      style={[
        styles.loadingContainer,
        backgroundColor ? {backgroundColor: backgroundColor} : null,
      ]}>
      {loadingText ? (
        <Text style={styles.loadingText}>{loadingText}</Text>
      ) : null}
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
    backgroundColor: '#FFFF99',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 15,
  },
});
