import {useRef, memo} from 'react';
import {Animated, Pressable, StyleSheet} from 'react-native';

type PressableWithAnimationProps = {
  onPress?: () => void;
  style: any;
  //   duration: number;
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
  const animated = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    animated.setValue(0.2);
    Animated.timing(animated, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    if (props.onPress) props.onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[props.style, {opacity: animated}]}>
        {props.children}
      </Animated.View>
    </Pressable>
  );
});

export default PressableWithAnimation;
export type {PressableWithAnimationProps};
