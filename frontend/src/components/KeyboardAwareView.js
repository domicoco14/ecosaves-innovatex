import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

/**
 * Shared keyboard frame for screens and modal forms. Keep this around the
 * existing layout so screens retain their normal dimensions while the keyboard
 * is closed and contract only when the keyboard is shown.
 */
export const KeyboardAwareView = ({
  children,
  style,
  behavior,
  androidBehavior,
  keyboardVerticalOffset = 0,
  ...props
}) => (
  <KeyboardAvoidingView
    {...props}
    style={[styles.frame, style]}
    behavior={behavior ?? (Platform.OS === 'ios' ? 'padding' : androidBehavior)}
    keyboardVerticalOffset={keyboardVerticalOffset}
  >
    {children}
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  frame: { flex: 1 },
});
