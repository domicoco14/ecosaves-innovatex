import React from 'react';
import { ScrollView } from 'react-native';

/**
 * ScrollView defaults for every form/input screen. Native ScrollView keeps the
 * focused TextInput visible as its viewport changes; the containing
 * KeyboardAwareView handles viewport resizing without applying duplicate
 * keyboard insets.
 */
export const KeyboardAwareScrollView = ({
  children,
  keyboardShouldPersistTaps = 'handled',
  keyboardDismissMode = 'on-drag',
  ...props
}) => (
  <ScrollView
    {...props}
    keyboardShouldPersistTaps={keyboardShouldPersistTaps}
    keyboardDismissMode={keyboardDismissMode}
  >
    {children}
  </ScrollView>
);
