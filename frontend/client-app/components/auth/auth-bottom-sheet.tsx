import { type PropsWithChildren, useCallback, useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  type PanResponderGestureState,
  type PanResponderInstance,
  useWindowDimensions,
  View,
} from 'react-native';

type AuthBottomSheetProps = PropsWithChildren<{
  expandedTopInset?: number;
  collapsedTopInset?: number;
}>;

export function AuthBottomSheet({
  children,
  expandedTopInset = 170,
  collapsedTopInset = 320,
}: AuthBottomSheetProps) {
  const { height } = useWindowDimensions();
  const sheetHeight = Math.max(320, height - expandedTopInset);
  const maxTranslate = Math.max(0, collapsedTopInset - expandedTopInset);

  const translateY = useRef(new Animated.Value(maxTranslate)).current;
  const currentTranslate = useRef(maxTranslate);

  const animateTo = useCallback((toValue: number) => {
    Animated.spring(translateY, {
      toValue,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start(() => {
      currentTranslate.current = toValue;
    });
  }, [translateY]);

  const panResponder: PanResponderInstance = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 4,
        onPanResponderGrant: () => {
          translateY.stopAnimation((value: number) => {
            currentTranslate.current = value;
          });
        },
        onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
          const nextValue = Math.max(
            0,
            Math.min(maxTranslate, currentTranslate.current + gestureState.dy)
          );
          translateY.setValue(nextValue);
        },
        onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
          const projected = currentTranslate.current + gestureState.dy + gestureState.vy * 80;
          const target = projected > maxTranslate / 2 ? maxTranslate : 0;
          animateTo(target);
        },
        onPanResponderTerminate: (_, gestureState: PanResponderGestureState) => {
          const projected = currentTranslate.current + gestureState.dy + gestureState.vy * 80;
          const target = projected > maxTranslate / 2 ? maxTranslate : 0;
          animateTo(target);
        },
      }),
    [animateTo, maxTranslate, translateY]
  );

  return (
    <Animated.View
      style={{
        height: sheetHeight,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 34,
        borderTopRightRadius: 34,
        paddingTop: 12,
        paddingBottom: 48,
        paddingHorizontal: 24,
        overflow: 'hidden',
        transform: [{ translateY }],
      }}>
      <View className="items-center pb-2" {...panResponder.panHandlers}>
        <View className="h-1.5 w-12 rounded-full bg-[#D6D6D6]" />
      </View>

      {children}
    </Animated.View>
  );
}
