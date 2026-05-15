import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { colors, fontWeight, layout, radius, shadow, spacing } from '@/constants/theme';
import { BrandMark } from '@/components/ui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Onboarding steps
// ---------------------------------------------------------------------------
type Step = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  accent: string;
};

const STEPS: Step[] = [
  {
    icon: 'shield-check-outline',
    title: 'A maior assessoria\npericial do Brasil',
    description:
      'Conectamos peritos judiciais e contratantes em todo o país com suporte completo desde o cadastro até o laudo.',
    accent: '#2A9D8F', // Teal
  },
  {
    icon: 'file-document-multiple-outline',
    title: 'Esqueça a\nburocracia',
    description:
      'Cuidamos de prazos processuais, formatação e protocolo de documentos. Você foca apenas na perícia.',
    accent: '#457B9D', // Blue
  },
  {
    icon: 'bank-outline',
    title: 'Mais oportunidades\ne renda',
    description:
      'Receba nomeações de diversos tribunais. Orientamos honorários e acompanhamos seus pagamentos.',
    accent: '#E9C46A', // Gold
  },
  {
    icon: 'handshake-outline',
    title: 'Comunicação\nsimplificada',
    description:
      'Fazemos a ponte direta com tribunais e advogados, facilitando e agilizando todo o trâmite.',
    accent: '#8338EC', // Purple
  },
  {
    icon: 'rocket-launch-outline',
    title: 'Tudo pronto para\ncomeçar',
    description:
      'Cadastre-se, envie sua documentação e deixe nossa equipe cuidar da sua habilitação nos tribunais.',
    accent: colors.primary, // Brand
  },
];

const STORAGE_KEY = '@mpericias:onboarding_seen';

export default function WelcomeScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const isLastStep = currentStep === STEPS.length - 1;
  const step = STEPS[currentStep];

  // Entrance animation for content
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    iconScale.setValue(0.3);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        damping: 12,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep, fadeAnim, slideAnim, iconScale]);

  // Subtle pulsing animation for the background ring
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const markSeen = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
  }, []);

  const handleNext = useCallback(() => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        damping: 15,
        stiffness: 300,
        useNativeDriver: true,
      }),
    ]).start();

    if (isLastStep) {
      markSeen();
      router.replace('/signup');
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [isLastStep, markSeen, buttonScale]);

  const handleSkip = useCallback(() => {
    markSeen();
    router.replace('/login');
  }, [markSeen]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* --- TOP SECTION (Visuals) --- */}
      <View style={styles.topSection}>
        {/* Dynamic Background */}
        <Animated.View
          style={[
            styles.bgGlow,
            { backgroundColor: step.accent, opacity: fadeAnim },
          ]}
        />
        
        {/* Header / Brand */}
        <View style={styles.header}>
          <BrandMark variant="onPrimary" label="MPericias" />
          {!isLastStep && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>Pular</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center Artwork */}
        <View style={styles.artworkContainer}>
          <Animated.View
            style={[
              styles.artworkRingOuter,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />
          <Animated.View
            style={[
              styles.artworkRingInner,
              {
                backgroundColor: step.accent,
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.15],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.artworkIconWrap,
              {
                transform: [{ scale: iconScale }],
                opacity: fadeAnim,
                backgroundColor: step.accent,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={step.icon}
              size={64}
              color={colors.white}
            />
          </Animated.View>
        </View>
      </View>

      {/* --- BOTTOM SECTION (Content Sheet) --- */}
      <View style={styles.bottomSheet}>
        {/* Progress Indicators */}
        <View style={styles.indicatorRow}>
          {STEPS.map((_, i) => {
            const isActive = i === currentStep;
            return (
              <View
                key={i}
                style={[
                  styles.indicator,
                  isActive && { backgroundColor: step.accent, width: 32 },
                ]}
              />
            );
          })}
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {step.title}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.description,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {step.description}
          </Animated.Text>
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: step.accent },
              ]}
              onPress={handleNext}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>
                {isLastStep ? 'Criar minha conta' : 'Continuar'}
              </Text>
              <Ionicons
                name={isLastStep ? "checkmark" : "arrow-forward"}
                size={22}
                color={colors.white}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Footer Link */}
          <TouchableOpacity onPress={handleSkip} style={styles.footerLink}>
            <Text style={styles.footerText}>
              Já tem uma conta? <Text style={[styles.footerTextBold, { color: step.accent }]}>Fazer Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A1118', // Dark elegant background for the top
  },

  // -- TOP SECTION --
  topSection: {
    height: SCREEN_HEIGHT * 0.55,
    width: '100%',
    paddingTop: layout.statusBarTop + spacing.md,
  },
  bgGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    zIndex: 10,
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  skipText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: fontWeight.bold,
  },
  artworkContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkRingOuter: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75,
    borderRadius: SCREEN_WIDTH * 0.4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  artworkRingInner: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
    borderRadius: SCREEN_WIDTH * 0.3,
  },
  artworkIconWrap: {
    width: 130,
    height: 130,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.primary,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    transform: [{ rotate: '-4deg' }],
  },

  // -- BOTTOM SECTION --
  bottomSheet: {
    height: SCREEN_HEIGHT * 0.45,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xxxl,
    justifyContent: 'space-between',
    ...shadow.primary,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    elevation: 20,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.xl,
  },
  indicator: {
    height: 6,
    width: 8,
    borderRadius: 3,
    backgroundColor: colors.borderSubtle,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: fontWeight.black,
    color: colors.text,
    lineHeight: 38,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 24,
    fontWeight: fontWeight.medium,
  },
  actionContainer: {
    marginTop: spacing.xl,
    width: '100%',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: radius.pill,
    ...shadow.primary,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: fontWeight.bold,
  },
  footerLink: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.xs,
  },
  footerText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  footerTextBold: {
    fontWeight: fontWeight.bold,
  },
});
