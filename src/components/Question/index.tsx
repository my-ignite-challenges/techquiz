import { Dimensions, Text } from "react-native";

import Animated, { Keyframe } from "react-native-reanimated";

import { Option } from "../Option";
import { styles } from "./styles";

type QuestionProps = {
  title: string;
  answers: string[];
};

type Props = {
  question: QuestionProps;
  selectedAnswer?: number | null;
  setSelectedAnswer?: (value: number) => void;
};

export function Question({
  question,
  selectedAnswer,
  setSelectedAnswer,
}: Props) {
  const SCREEN_WIDTH = Dimensions.get("window").width;

  const enteringKeyframe = new Keyframe({
    0: {
      opacity: 0,
      transform: [{ translateX: SCREEN_WIDTH }, { rotate: "90deg" }],
    },
    70: {
      opacity: 0.3,
    },
    100: {
      opacity: 1,
      transform: [{ translateX: 0 }, { rotate: "0deg" }],
    },
  });

  const exitingKeyframe = new Keyframe({
    from: {
      opacity: 1,
      transform: [
        {
          translateX: 0,
        },
        { rotate: "0deg" },
      ],
    },
    to: {
      opacity: 0,
      transform: [
        {
          translateX: SCREEN_WIDTH * -1,
        },
        { rotate: "-90deg" },
      ],
    },
  });

  return (
    <Animated.View
      style={styles.container}
      entering={enteringKeyframe.duration(400)}
      exiting={exitingKeyframe.duration(400)}
    >
      <Text style={styles.title}>{question.title}</Text>

      {question.answers.map((answer, index) => (
        <Option
          key={index}
          title={answer}
          checked={selectedAnswer === index}
          onPress={() => setSelectedAnswer && setSelectedAnswer(index)}
        />
      ))}
    </Animated.View>
  );
}
