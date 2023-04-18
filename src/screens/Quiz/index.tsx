import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Loading } from "../../components/Loading";
import { Question } from "../../components/Question";
import { QuizHeader } from "../../components/QuizHeader";
import { ConfirmButton } from "../../components/ConfirmButton";
import { OutlineButton } from "../../components/OutlineButton";
import { ProgressBar } from "../../components/ProgressBar";
import { QUIZ } from "../../data/quiz";

import { historyAdd } from "../../storage/quizHistoryStorage";
import { THEME } from "../../styles/theme";
import { styles } from "./styles";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface Params {
  id: string;
}

type QuizProps = typeof QUIZ[0];

export function Quiz() {
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quiz, setQuiz] = useState<QuizProps>({} as QuizProps);
  const [selectedAnswer, setSelectedAnswer] = useState<null | number>(null);

  const { navigate } = useNavigation();

  const route = useRoute();

  const { id } = route.params as Params;

  const shake = useSharedValue(0);
  const scrollYOffset = useSharedValue(0);
  const questionCardPosition = useSharedValue(0);

  const shakeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            shake.value,
            [0, 0.5, 1, 1.5, 2, 2.5, 3],
            [0, -15, 0, 15, 0, -15, 0]
          ),
        },
      ],
    };
  });

  const fixedProgressBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      paddingTop: 50,
      backgroundColor: THEME.COLORS.GREY_500,
      width: "110%",
      left: "-5%",
      zIndex: 1,
      marginBottom: 100,
      opacity: interpolate(
        scrollYOffset.value,
        [50, 90],
        [0, 1],
        Extrapolate.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            scrollYOffset.value,
            [50, 100],
            [-40, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  const animatedHeaderStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollYOffset.value,
        [60, 90],
        [1, 0],
        Extrapolate.CLAMP
      ),
    };
  });

  const animatedDragQuestionCardStyles = useAnimatedStyle(() => {
    const QUESTION_CARD_INCLINATION = 10;

    const rotationZ = questionCardPosition.value / QUESTION_CARD_INCLINATION;

    return {
      transform: [
        { translateX: questionCardPosition.value },
        { rotateZ: `${rotationZ}deg` },
      ],
    };
  });

  function handleSkipConfirmation() {
    Alert.alert("Pular", "Deseja realmente pular a questão?", [
      { text: "Sim", onPress: () => handleNextQuestion() },
      { text: "Não", onPress: () => {} },
    ]);
  }

  async function handleFinished() {
    await historyAdd({
      id: new Date().getTime().toString(),
      title: quiz.title,
      level: quiz.level,
      points,
      questions: quiz.questions.length,
    });

    navigate("finish", {
      points: String(points),
      total: String(quiz.questions.length),
    });
  }

  function handleNextQuestion() {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prevState) => prevState + 1);
    } else {
      handleFinished();
    }
  }

  async function handleConfirmation() {
    if (selectedAnswer === null) {
      return handleSkipConfirmation();
    }

    if (quiz.questions[currentQuestion].correct === selectedAnswer) {
      setPoints((prevState) => prevState + 1);
    } else {
      shakeWrongAnswerCard();
    }

    setSelectedAnswer(null);

    handleNextQuestion();
  }

  function handleStop() {
    Alert.alert("Parar", "Deseja parar agora?", [
      {
        text: "Não",
        style: "cancel",
      },
      {
        text: "Sim",
        style: "destructive",
        onPress: () => navigate("home"),
      },
    ]);

    return true;
  }

  function shakeWrongAnswerCard() {
    shake.value = withSequence(
      withTiming(3, { duration: 400, easing: Easing.bounce }),
      withTiming(0)
    );
  }

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollYOffset.value = event.contentOffset.y;
    },
  });

  const onPan = Gesture.Pan()
    .onUpdate((event) => {
      const questionCardMovedToLeft = event.translationX < 0;

      if (questionCardMovedToLeft) {
        questionCardPosition.value = event.translationX;
      }
    })
    .onEnd((event) => {
      const QUESTION_CARD_SKIP_THRESHOLD = -200;

      if (event.translationX < QUESTION_CARD_SKIP_THRESHOLD) {
        runOnJS(handleSkipConfirmation)();
      }
      questionCardPosition.value = withTiming(0);
    });

  useEffect(() => {
    const quizSelected = QUIZ.filter((item) => item.id === id)[0];
    setQuiz(quizSelected);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={fixedProgressBarAnimatedStyle}>
        <Text style={styles.fixedProgressBarTitle}>{quiz.title}</Text>
        <ProgressBar
          total={quiz.questions.length}
          current={currentQuestion + 1}
        />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.question}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.header, animatedHeaderStyles]}>
          <QuizHeader
            title={quiz.title}
            currentQuestion={currentQuestion + 1}
            totalOfQuestions={quiz.questions.length}
          />
        </Animated.View>

        <GestureDetector gesture={onPan}>
          <Animated.View
            style={[shakeAnimatedStyle, animatedDragQuestionCardStyles]}
          >
            <Question
              key={quiz.questions[currentQuestion].title}
              question={quiz.questions[currentQuestion]}
              selectedAnswer={selectedAnswer}
              setSelectedAnswer={setSelectedAnswer}
            />
          </Animated.View>
        </GestureDetector>

        <View style={styles.footer}>
          <OutlineButton title="Parar" onPress={handleStop} />
          <ConfirmButton onPress={handleConfirmation} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}
