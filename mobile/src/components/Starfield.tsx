import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const stars = [
  { left: '8%', top: '14%', size: 2, delay: 0 },
  { left: '22%', top: '28%', size: 1.5, delay: 400 },
  { left: '78%', top: '12%', size: 2, delay: 200 },
  { left: '88%', top: '32%', size: 1.5, delay: 700 },
  { left: '14%', top: '62%', size: 1.5, delay: 500 },
  { left: '70%', top: '58%', size: 2, delay: 150 },
  { left: '48%', top: '18%', size: 1.5, delay: 900 },
  { left: '36%', top: '74%', size: 1.5, delay: 300 },
  { left: '84%', top: '78%', size: 2, delay: 650 },
  { left: '6%', top: '42%', size: 1.5, delay: 1100 },
] as const;

function Star({
  left,
  top,
  size,
  delay,
  color,
}: {
  left: `${number}%`;
  top: `${number}%`;
  size: number;
  delay: number;
  color: string;
}) {
  const opacity = useSharedValue(0.15);
  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(0.85, { duration: 2200 }), withTiming(0.15, { duration: 2200 })),
        -1,
        false,
      ),
    );
  }, [delay, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        styles.star,
        style,
        { left, top, width: size, height: size, borderRadius: size, backgroundColor: color },
      ]}
    />
  );
}

export function Starfield({ color }: { color: string }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((star) => (
        <Star key={`${star.left}-${star.top}`} {...star} color={color} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
  },
});
