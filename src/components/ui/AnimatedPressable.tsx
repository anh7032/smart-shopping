import React from 'react';
import { GestureResponderEvent, Pressable, StyleProp, ViewStyle } from 'react-native';

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

// FIX crash "Transform with key of scale must be a number":
// Bản an toàn tuyệt đối: không dùng transform/scale Animated gì cả.
// Chỉ dùng opacity tĩnh khi pressed => không bao giờ dính lỗi transform,
// vẫn giữ cảm giác nhấn, giữ nguyên layout và onPress.
export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  children,
  onPress,
  style,
  pressedStyle,
  accessibilityLabel,
  testID,
}) => {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        style,
        { opacity: pressed ? 0.85 : 1 },
        pressed ? pressedStyle : null,
      ]}
    >
      {children}
    </Pressable>
  );
};
