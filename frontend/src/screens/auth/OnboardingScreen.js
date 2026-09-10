import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EcoSavesLogo } from '../../components/EcoSavesLogo';

const { height } = Dimensions.get('window');

export const OnboardingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00587E" />

      {/* Top hero panel */}
      <View style={styles.heroPanel}>
        <SafeAreaView style={styles.heroSafeArea}>
          <EcoSavesLogo variant="hero" size={148} />
        </SafeAreaView>
      </View>

      {/* Bottom content panel */}
      <SafeAreaView style={styles.contentPanel} edges={['bottom']}>
        <View style={styles.contentInner}>
          <View style={styles.textSection}>
            <Text style={styles.headline}>
              Save together,{'\n'}the digitized ajo way
            </Text>
            <Text style={styles.subheadline}>
              Join an ajo/esusu group, contribute automatically via Ecobank
              Blaze, and get paid out on your turn. No cash, no wahala.
            </Text>
          </View>

          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.primaryBtnText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLinkWrapper}
            >
              <Text style={styles.loginLinkText}>I already have an account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  heroPanel: {
    height: height * 0.52,
    backgroundColor: '#00587E',
  },
  heroSafeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentPanel: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  contentInner: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
  },
  textSection: {
    alignItems: 'flex-start',
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F1A22',
    lineHeight: 33,
    letterSpacing: -0.3,
    marginBottom: 14,
    textAlign: 'left',
  },
  subheadline: {
    fontSize: 14,
    fontWeight: '400',
    color: '#7C8A94',
    lineHeight: 21,
    textAlign: 'left',
  },
  actionSection: {
    width: '100%',
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#00587E',
    borderRadius: 15,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#00587E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  loginLinkWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  loginLinkText: {
    color: '#00587E',
    fontWeight: '700',
    fontSize: 14,
  },
});