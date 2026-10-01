import React, { useRef, useState } from 'react';
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
  const [isFocused, setIsFocused] = useState(false);

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
          accessibilityLabel={`${length}-digit passcode`}
          accessibilityHint="Enter your passcode"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <View style={styles.boxesRow}>
          {Array.from({ length }).map((_, index) => {
            const isFilled = index < digits.length;
            const isActive = isFocused && (index === digits.length || (index === length - 1 && digits.length === length));
            const char = digits[index];

            return (
              <View
                key={index}
                style={[
                  styles.box,
                  isFilled && styles.boxFilled,
                  isActive && styles.boxFocused,
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
    marginTop: 8,
    marginBottom: 10,
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
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE5E8',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    height: 54,
    justifyContent: 'center',
    marginHorizontal: 4,
    maxWidth: 50,
  },
  boxFilled: {
    backgroundColor: '#EAF4F6',
    borderColor: '#A8C7D0',
  },
  boxFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00597C',
    borderWidth: 1.7,
    shadowColor: '#005B7F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
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
