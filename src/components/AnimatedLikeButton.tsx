import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  liked: boolean;
  likesCount: number;
  onPress: () => void;
}

const AnimatedLikeButton = ({ liked, likesCount, onPress }: Props) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    // Bounce animation when liked
    scale.value = withSequence(
      withSpring(1.4, { damping: 5, stiffness: 300 }),
      withSpring(1, { damping: 5, stiffness: 300 }),
    );
    opacity.value = withSequence(
      withTiming(0.6, { duration: 100 }),
      withTiming(1, { duration: 100 }),
    );
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Text style={styles.text}>
          {liked ? '❤️' : '🤍'} {likesCount}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  text: { fontSize: 15, color: '#666' },
});

export default AnimatedLikeButton;