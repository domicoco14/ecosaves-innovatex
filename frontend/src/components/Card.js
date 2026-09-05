import React from 'react';
import { View, StyleSheet } from 'react-native';

export const Card = ({ children, style, borderRadius = 20, padding = 18 }) => {
  return (
    <View style={[styles.card, { borderRadius, padding }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    // Soft shadow elevation
    shadowColor: '#161C20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
});
