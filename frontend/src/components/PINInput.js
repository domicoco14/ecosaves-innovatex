import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export const PINInput = ({
  value = '',
  onChange = () => {},
  length = 6,
  mask = true,
  error = false,
  autoFocus = true,
}) => {
  const inputRef = useRef(null);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const digits = value.split('');

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
            onChange(cleaned);
          }}
          keyboardType="number-pad"
          maxLength={length}
          autoFocus={autoFocus}
          style={styles.hiddenInput}
          caretHidden
        />

        <View style={styles.boxesRow}>
          {Array.from({ length }).map((_, index) => {
            const isFilled = index < digits.length;
            const isFocused = index === digits.length || (index === length - 1 && digits.length === length);
            const char = digits[index];

            return (
              <View
                key={index}
                style={[
                  styles.box,
                  isFilled && styles.boxFilled,
                  isFocused && styles.boxFocused,
                  error && styles.boxError,
                ]}
              >
                {isFilled ? (
                  <Text style={styles.bullet}>{mask ? '•' : char}</Text>
                ) : isFocused ? (
                  <View style={styles.cursor} />
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 14,
    width: '100%',
  },
  hiddenInput: {
    height: 1,
    opacity: 0,
    position: 'absolute',
    width: 1,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  box: {
    alignItems: 'center',
    backgroundColor: '#F0F3F5',
    borderColor: '#E2E7EB',
    borderRadius: 14,
    borderWidth: 1.5,
    height: 52,
    justifyContent: 'center',
    marginHorizontal: 5,
    width: 46,
  },
  boxFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: '#005B7F',
  },
  boxFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#005B7F',
    borderWidth: 2,
    shadowColor: '#005B7F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  boxError: {
    backgroundColor: '#FEE9E9',
    borderColor: '#D32F2F',
  },
  bullet: {
    color: '#005B7F',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 28,
  },
  cursor: {
    backgroundColor: '#005B7F',
    borderRadius: 1,
    height: 20,
    width: 2,
  },
});
