import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export const EcoSavesLogo = ({ variant = 'badge', size, style }) => {
  const boxSize = size || (variant === 'hero' ? 120 : 44);
  const borderRadius = Math.round(boxSize * 0.18);

  return (
    <View style={[styles.logoSquareWrapper, { width: boxSize, height: boxSize, borderRadius }, style]}>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: boxSize, height: boxSize, borderRadius }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoSquareWrapper: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#005B7F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
});
