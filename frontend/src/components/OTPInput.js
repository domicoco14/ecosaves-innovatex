import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export const OTPInput = ({ length = 4, onComplete, value, onChange }) => {
  const [code, setCode] = useState(Array(length).fill(''));
  const inputsRef = useRef([]);

  const handleChangeText = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (onChange) {
      onChange(newCode.join(''));
    }

    // Auto focus next input
    if (text && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== '') && onComplete) {
      onComplete(newCode.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputsRef.current[index] = ref)}
            style={[styles.box, code[index] ? styles.activeBox : null]}
            keyboardType="number-pad"
            maxLength={1}
            value={code[index]}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            placeholder="X"
            placeholderTextColor="#8E99A4"
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    width: '100%',
  },
  box: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#F0F3F5',
    borderWidth: 1,
    borderColor: '#E2E7EC',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#161C20',
  },
  activeBox: {
    borderColor: '#005B7F',
    backgroundColor: '#FFFFFF',
  },
});
