import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const SuccessIndicator: React.FC<{ 
  visible: boolean,
  successStyle: any
}> = ({ visible, successStyle }) => {
  const [opacity] = useState(new Animated.Value(0)); // Initial value for opacity: 0

  useEffect(() => {
    if (visible) {
      // Fade in the indicator
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // After fading in, wait for 1 second, then fade out
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 1000);
      });
    }
  }, [visible, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[successStyle, { opacity }]}>
      {/* <MaterialIcons name="check" size={24} color="white" /> */}
    </Animated.View>
  );
};

export default SuccessIndicator;
