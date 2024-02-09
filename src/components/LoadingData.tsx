import {View, ActivityIndicator, StyleSheet, Text} from 'react-native';

export type LoadingDataProps = {
  loadingText?: string;
  style?: any;
  blendBackground?: boolean;
};

const LoadingData = ({
  loadingText,
  style,
  blendBackground,
}: LoadingDataProps) => {
  const backgroundStyle = blendBackground ? styles.blendBackground : {};
  return (
    <View style={[styles.loadingContainer, backgroundStyle]}>
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
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 15,
  },
  blendBackground: {
    backgroundColor: '#FFFF99', // Could be automized
  },
});
