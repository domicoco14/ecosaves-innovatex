import React from 'react';
import { View, StyleSheet } from 'react-native';

export const ProgressBar = ({
  progress = 0, // Number between 0 and 1 (or 0 to 100 if specified)
  color = '#E98591', // Accent coral by default, or #00597C / #29875A / #FFC107
  height = 8,
  backgroundColor = '#E5EBF0',
  style,
}) => {
  // Normalize progress to a 0-1 scale
  const normalizedProgress = progress > 1 ? progress / 100 : Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.track, { height, backgroundColor }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${normalizedProgress * 100}%`,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
  },
});
