import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/Button';

export const OnboardingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to EcoSaves</Text>
        <Text style={styles.subtitle}>
          Digitizing rotating group savings (Ajo/Esusu) securely via Ecobank Blaze.
        </Text>
      </View>
      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('Signup')}
        />
        <Button
          title="I already have an account"
          variant="outline"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F9',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00597C',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#737980',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  footer: {
    width: '100%',
  },
});
