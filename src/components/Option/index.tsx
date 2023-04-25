import { useEffect } from "react";

import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import {
  BlurMask,
  Canvas,
  Circle,
  Easing,
  Path,
  Skia,
  runTiming,
  useValue,
} from "@shopify/react-native-skia";

import { styles } from "./styles";
import { THEME } from "../../styles/theme";

type Props = TouchableOpacityProps & {
  checked: boolean;
  title: string;
};

const CIRCLE_SIZE = 28;
const CIRCLE_STROKE = 2;

export function Option({ checked, title, ...rest }: Props) {
  const checkSignProgressPercentage = useValue(0);
  const innerCircle = useValue(0);

  const CIRCLE_RADIUS = (CIRCLE_SIZE - CIRCLE_STROKE) / 2;
  const INNER_CIRCLE_RADIUS = CIRCLE_RADIUS / 2;

  const skiaPath = Skia.Path.Make();
  skiaPath.addCircle(CIRCLE_SIZE, CIRCLE_SIZE, CIRCLE_RADIUS);

  useEffect(() => {
    if (checked) {
      runTiming(checkSignProgressPercentage, 1, { duration: 700 });
      runTiming(innerCircle, INNER_CIRCLE_RADIUS, { easing: Easing.bounce });
    } else {
      runTiming(checkSignProgressPercentage, 0, { duration: 700 });
      runTiming(innerCircle, 0, { duration: 300 });
    }
  }, [checked]);

  return (
    <TouchableOpacity
      style={[styles.container, checked && styles.checked]}
      {...rest}
    >
      <Text style={styles.title}>{title}</Text>

      <Canvas style={{ height: CIRCLE_SIZE * 2, width: CIRCLE_SIZE * 2 }}>
        <Path
          path={skiaPath}
          color={THEME.COLORS.GREY_500}
          style="stroke"
          strokeWidth={CIRCLE_STROKE}
        />

        <Path
          path={skiaPath}
          color={THEME.COLORS.BRAND_LIGHT}
          style="stroke"
          strokeWidth={CIRCLE_STROKE}
          start={0}
          end={checkSignProgressPercentage}
        >
          <BlurMask blur={1} style="solid" />
        </Path>

        <Circle
          cx={CIRCLE_SIZE}
          cy={CIRCLE_SIZE}
          r={innerCircle}
          color={THEME.COLORS.BRAND_LIGHT}
        >
          <BlurMask blur={4} style="solid" />
        </Circle>
      </Canvas>
    </TouchableOpacity>
  );
}
