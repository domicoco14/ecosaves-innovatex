import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const StatusBadge = ({ label, type = 'active', style, textStyle }) => {
  // Types: 'active' / 'success', 'pending' / 'warning', 'inactive' / 'muted', 'accent'
  let bg = '#E6F5EB';
  let color = '#29875A';

  switch (type) {
    case 'active':
    case 'success':
      bg = '#E6F5EB';
      color = '#29875A';
      break;
    case 'pending':
    case 'warning':
      bg = '#FFF8E6';
      color = '#B78103';
      break;
    case 'accent':
    case 'your-turn':
      bg = '#FDEEEF';
      color = '#E98591';
      break;
    case 'inactive':
    case 'muted':
    default:
      bg = '#F0F2F5';
      color = '#737980';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color }, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
