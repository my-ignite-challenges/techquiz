import { useEffect } from "react";

import { BlurMask, Canvas, Rect } from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { THEME } from "../../styles/theme";

const ANSWER_STATUS_COLORS = [
  "transparent",
  THEME.COLORS.BRAND_LIGHT,
  THEME.COLORS.DANGER_LIGHT,
];

type Props = {
  answerStatus: number;
};

export function FeedbackOverlay({ answerStatus }: Props) {
  const { width, height } = useWindowDimensions();

  const overlayOpacity = useSharedValue(0);

  const overlayColor = ANSWER_STATUS_COLORS[answerStatus];

  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
    };
  });

  useEffect(() => {
    overlayOpacity.value = withSequence(
      withTiming(0.4, { duration: 400, easing: Easing.bounce }),
      withTiming(0)
    );
  }, [answerStatus]);

  return (
    <Animated.View
      style={[{ height, width, position: "absolute" }, animatedOverlayStyle]}
    >
      <Canvas style={{ flex: 1 }}>
        <Rect x={0} y={0} width={width} height={height} color={overlayColor}>
          <BlurMask blur={50} style="inner" />
        </Rect>
      </Canvas>
    </Animated.View>
  );
}
