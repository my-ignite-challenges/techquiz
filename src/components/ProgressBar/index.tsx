import { View } from "react-native";

import { styles } from "./styles";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

interface Props {
  total: number;
  current: number;
}

export function ProgressBar({ total, current }: Props) {
  const percentage = Math.round((current / total) * 100);

  const progress = useSharedValue(percentage);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  useEffect(() => {
    progress.value = withTiming(percentage);
  }, [current]);

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.progress, animatedStyle]} />
    </View>
  );
}
