import { useEffect } from "react";
import { StyleSheet } from "react-native";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

import {
  getRandomRotation,
  PIECES_DISTANCE,
  PIECE_SCALE,
  PUZZLE_PIECES,
  PUZZLE_PIECE_BOX_SIZE,
  PUZZLE_PIECE_SIZE,
  SVG_SIZE,
} from "../utils/Constants";

import Shape from "./Shape";

type Props = {
  index: number;
  shape: string;
  shuffledPieces: number[];
  correctPieces: SharedValue<number>;
};

function PuzzlePiece({ index, shape, shuffledPieces, correctPieces }: Props) {
  const shuffledIndex = shuffledPieces[index];
  const piece = PUZZLE_PIECES[index];
  const shuffledPiece = PUZZLE_PIECES[shuffledIndex];
  const delay = 1150 + index * 150;
  const randomRotation = getRandomRotation();
  const safeSpacing = PUZZLE_PIECE_SIZE / 2;

  const initialX = (PUZZLE_PIECE_SIZE / 2) * piece.x;
  const initialY = (PUZZLE_PIECE_SIZE / 2) * piece.y;
  const shuffledX = SVG_SIZE * shuffledPiece.x - PIECES_DISTANCE;
  const shuffledY = SVG_SIZE * shuffledPiece.y;

  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const z = useSharedValue(0);
  const isEnabled = useSharedValue(0);

  // Context pour stocker les positions initiales
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(delay, withSpring(shuffledX));
    translateY.value = withDelay(delay, withSpring(shuffledY));
    scale.value = withDelay(delay, withSpring(PIECE_SCALE));
    rotate.value = withDelay(delay, withSpring(randomRotation));
    isEnabled.value = withDelay(delay, withTiming(1));
  }, [shuffledPieces]);

  // Nouvelle API Gesture
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (!isEnabled.value) return;

      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
      scale.value = withSpring(1);
      rotate.value = withSpring(0);
      z.value = 1;
    })
    .onEnd(() => {
      if (!isEnabled.value) return;

      const isCorrect =
        translateX.value >= initialX - safeSpacing &&
        translateX.value <= initialX + safeSpacing &&
        translateY.value <= initialY + safeSpacing &&
        translateY.value >= initialY - safeSpacing;

      translateX.value = withSpring(isCorrect ? initialX : shuffledX);
      translateY.value = withSpring(isCorrect ? initialY : shuffledY);
      scale.value = withSpring(isCorrect ? 1 : PIECE_SCALE);
      rotate.value = withSpring(isCorrect ? 0 : randomRotation);
      z.value = withDelay(500, withTiming(0)); // Delay to wait for animation

      if (isCorrect) {
        isEnabled.value = 0;
        correctPieces.value++;
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    zIndex: z.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Shape type="piece" shape={shape} piece={piece} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: PUZZLE_PIECE_BOX_SIZE,
    height: PUZZLE_PIECE_BOX_SIZE,
  },
});

export default PuzzlePiece;