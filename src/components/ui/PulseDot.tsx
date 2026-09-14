import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../Theme';

interface PulseDotProps {
  size?: number;
  color?: string;
}

export const PulseDot: React.FC<PulseDotProps> = ({ size = 8, color = '#74E49C' }) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1150,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1150,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 0.35],
  });

  return (
    <View style={[styles.dot, { width: size, height: size, borderRadius: size / 2 }]}>
      <Animated.View
        style={[
          styles.pulse,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.GLASS,
    overflow: 'hidden',
  },
  pulse: {
    position: 'absolute',
  },
});
