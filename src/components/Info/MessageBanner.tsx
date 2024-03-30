import {StyleSheet, Text, TouchableOpacity} from 'react-native';

type MessageBannerProps = {
  text: string;
  onPress: () => void;
};

const MessageBanner: React.FC<MessageBannerProps> = ({text, onPress}) => {
  return (
    <TouchableOpacity accessibilityRole="button" style={styles.container} onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ff5d54',
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    alignItems: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontSize: 22,
    color: '#ffffff', // White color for the text
    fontWeight: 'bold',
  },
});

export default MessageBanner;
