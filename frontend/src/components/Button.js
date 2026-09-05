import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' (#00597C), 'accent' (#E98591), 'outline', 'ghost'
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isAccent = variant === 'accent';

  let backgroundColor = '#00597C'; // Primary teal
  let textColor = '#FFFFFF';
  let borderColor = 'transparent';

  if (isAccent) {
    backgroundColor = '#E98591'; // Coral accent
    textColor = '#FFFFFF';
  } else if (isOutline) {
    backgroundColor = 'transparent';
    textColor = '#00597C';
    borderColor = '#00597C';
  } else if (isGhost) {
    backgroundColor = 'transparent';
    textColor = '#00597C';
  }

  if (disabled) {
    backgroundColor = '#D0D5DD';
    textColor = '#888888';
    borderColor = 'transparent';
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor, borderColor, borderWidth: isOutline ? 1.5 : 0 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
