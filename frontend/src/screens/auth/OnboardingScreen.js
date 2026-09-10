import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EcoSavesLogo } from '../../components/EcoSavesLogo';

const { width, height } = Dimensions.get('window');

export const OnboardingScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#041021" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. EcoSaves Branding Header */}
        <View style={styles.brandHeader}>
          <EcoSavesLogo variant="hero" />
        </View>

        {/* 2. Hero Visual Focal Point */}
        {/* <View style={styles.heroWrapper}>
          <Image
            source={require('../../../assets/onboarding_hero.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View> */}

        {/* 3. Value Proposition Section */}
        <View style={styles.valueSection}>
          <Text style={styles.headline}>Save together with Zero Wahala</Text>
          <Text style={styles.subheadline}>
            Join trusted circles in Nigeria, Ghana, Kenya and across Africa seamlessly.
          </Text>
        </View>

        {/* 4. Action Buttons & Trust Footer */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.primaryBtnText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryBtnText}>Log In</Text>
          </TouchableOpacity>

          <View style={styles.trustFooter}>
            <Text style={styles.trustFooterText}>
              {/* 🔒 Ecobank Pan-African Partner • Licensed & Insured */}
              Ecobank Pan-African Partner • Licensed & Insured
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#041021',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  heroWrapper: {
    width: '100%',
    height: Math.min(height * 0.42, 340),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  valueSection: {
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  headline: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  subheadline: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  actionContainer: {
    width: '100%',
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: '#FFCC00', // Warm African Fintech Gold
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#030C1E',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  trustFooter: {
    alignItems: 'center',
  },
  trustFooterText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
