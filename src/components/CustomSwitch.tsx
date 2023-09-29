import { useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";

type CustomSwitchProps = {
    offText: string;
    onText: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
};

const CustomSwitch: React.FC<CustomSwitchProps> = ({ 
    offText,
    onText,
    value, 
    onValueChange 
}) => {
  const backgroundColor = value ? "#fcf50f" : "#767577";
  const translateX = useRef(new Animated.Value(value ? 58 : 0)).current; // Start value

  const handlePress = () => {
    const newValue = !value;
    onValueChange(newValue);
    Animated.timing(translateX, {
      toValue: newValue ? 58 : 0,
      duration: 200,
      useNativeDriver: true, // Use native driver for smoother animation
    }).start();
  };

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor }]} onPress={handlePress}>
      <Animated.View style={[styles.slider, { transform: [{ translateX }] }]}>
        <Text style={styles.sliderText}>{value ? onText : offText}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default CustomSwitch;

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  slider: {
    width: 50,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: "#f4f3f4",
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderText: {
    fontSize: 16,
    color: 'black',
  },
});