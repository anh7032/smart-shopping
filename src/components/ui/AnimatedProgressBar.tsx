import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../Theme';

interface AnimatedProgressBarProps {
  progress: number;
  danger?: boolean;
  trackColor?: string;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  danger = false,
  trackColor = '#E7ECE8',
}) => {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const clamped = Math.max(0, Math.min(100, progress));
    const animation = Animated.timing(width, {
      toValue: clamped,
      duration: 650,
      useNativeDriver: false,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [progress, width]);

  return (
    <View style={[styles.track, { backgroundColor: trackColor }]}>
      <Animated.View
        style={[
          styles.fill,
          danger ? styles.dangerFill : styles.safeFill,
          {
            width: width.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
      <View style={styles.highlight} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 12,
  },
  fill: {
    height: '100%',
    borderRadius: 8,
  },
  safeFill: {
    backgroundColor: COLORS.GREEN,
  },
  dangerFill: {
    backgroundColor: COLORS.RED,
  },
  highlight: {
    position: 'absolute',
    top: 1,
    left: 6,
    right: 6,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
  },
});
