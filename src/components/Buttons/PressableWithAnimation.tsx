import {useRef, memo, useEffect} from 'react';
import {Animated, Pressable, StyleSheet} from 'react-native';

type PressableWithAnimationProps = {
  onPress?: () => void;
  style: any;
  children: React.ReactNode;
};

/**
 * A memoized pressable component with animation.
 *
 * @component On press, the component will animate to a lower opacity and then back to its original opacity. On scroll, the animation will be disabled.
 * @param {PressableWithAnimationProps} props - The props for the PressableWithAnimation component.
 * @returns {JSX.Element} - The rendered PressableWithAnimation component.
 */
const PressableWithAnimation = memo((props: PressableWithAnimationProps) => {
  const animatedOpacity = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      // Animate opacity to 0.2
      Animated.timing(animatedOpacity, {
        toValue: 0.2,
        duration: 100,
        useNativeDriver: true,
      }),
      // Animate it back to 1
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (props.onPress) {
      props.onPress();
    }
  };

  useEffect(() => {
    return () => {
      animatedOpacity.stopAnimation(); // Stop animation on component unmount
    };
  }, [animatedOpacity]);

  return (
    <Pressable accessibilityRole="button" onPress={handlePress}>
      <Animated.View style={[props.style, {opacity: animatedOpacity}]}>
        {props.children}
      </Animated.View>
    </Pressable>
  );
});

export default PressableWithAnimation;
export type {PressableWithAnimationProps};
