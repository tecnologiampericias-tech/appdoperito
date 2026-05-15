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
import { colors, fontWeight, layout, radius, spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Onboarding steps – inspired by https://mpericias.com.br value propositions
// ---------------------------------------------------------------------------
type Step = {
  icon: React.ReactNode;
  accentColor: string;
  bgGradientTop: string;
  bgGradientBottom: string;
  tag: string;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    icon: <MaterialCommunityIcons name="shield-check-outline" size={44} color="#fff" />,
    accentColor: '#4AAFA6',
    bgGradientTop: '#4AAFA6',
    bgGradientBottom: '#2A8A7D',
    tag: 'ASSESSORIA COMPLETA',
    title: 'A maior assessoria\npericial do Brasil',
    description:
      'Conectamos peritos judiciais e contratantes em todo o território nacional. Mais oportunidades, mais segurança.',
  },
  {
    icon: <MaterialCommunityIcons name="file-document-check-outline" size={44} color="#fff" />,
    accentColor: '#5B8DEF',
    bgGradientTop: '#5B8DEF',
    bgGradientBottom: '#3A6DD0',
    tag: 'SEM BUROCRACIA',
    title: 'Nós cuidamos dos\nprazos e documentos',
    description:
      'Gestão completa de prazos processuais, formatação e protocolo de laudos. Você foca na perícia, nós resolvemos o resto.',
  },
  {
    icon: <Ionicons name="cash-outline" size={44} color="#fff" />,
    accentColor: '#E6A23C',
    bgGradientTop: '#E6A23C',
    bgGradientBottom: '#C4862A',
    tag: 'RENDA EXTRA',
    title: 'Ganhe com perícias\nem todo o Brasil',
    description:
      'Receba nomeações de tribunais de qualquer estado. Orientamos sobre honorários e acompanhamos o pagamento.',
  },
  {
    icon: <MaterialCommunityIcons name="account-group-outline" size={44} color="#fff" />,
    accentColor: '#9B6FE8',
    bgGradientTop: '#9B6FE8',
    bgGradientBottom: '#7B4FC8',
    tag: 'INTERMEDIAÇÃO',
    title: 'Comunicação com\ntribunais e advogados',
    description:
      'Fazemos o contato direto com as partes envolvidas, facilitando toda a comunicação do processo pericial.',
  },
  {
    icon: <MaterialCommunityIcons name="calendar-check-outline" size={44} color="#fff" />,
    accentColor: '#4AAFA6',
    bgGradientTop: '#1A3A36',
    bgGradientBottom: '#0D1F1D',
    tag: 'COMECE AGORA',
    title: 'Cadastre-se e\ncomece a atuar',
    description:
      'Registro simples e rápido. Em poucos passos você estará pronto para receber nomeações e realizar perícias.',
  },
];

const STORAGE_KEY = '@mpericias:onboarding_seen';

export default function WelcomeScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [prevStep, setPrevStep] = useState(0);

  const fadeAnims = useRef(STEPS.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(STEPS.map(() => new Animated.Value(40))).current;
  const iconScale = useRef(STEPS.map(() => new Animated.Value(0.5))).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const bgFade = useRef(new Animated.Value(1)).current;

  const isLastStep = currentStep === STEPS.length - 1;

  // Animate in current step
  useEffect(() => {
    // Reset content animations
    fadeAnims[currentStep].setValue(0);
    slideAnims[currentStep].setValue(30);
    iconScale[currentStep].setValue(0.5);

    // Background crossfade
    if (currentStep !== prevStep) {
      bgFade.setValue(0);
      Animated.timing(bgFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false, // backgroundColor cannot use native driver
      }).start(() => {
        setPrevStep(currentStep);
      });
    }

    // Content entrance
    Animated.parallel([
      Animated.timing(fadeAnims[currentStep], {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnims[currentStep], {
        toValue: 0,
        damping: 20,
        stiffness: 150,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale[currentStep], {
        toValue: 1,
        damping: 12,
        stiffness: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const markSeen = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
  }, []);

  const handleNext = useCallback(() => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.93,
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

  const step = STEPS[currentStep];
  const prevStepData = STEPS[prevStep];

  // Interpolate bg color for smooth transition
  const bgColor = bgFade.interpolate({
    inputRange: [0, 1],
    outputRange: [prevStepData.bgGradientTop, step.bgGradientTop],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style="light" />

      {/* Background decoration circles */}
      <View style={[styles.decorCircle1, { backgroundColor: step.bgGradientBottom }]} />
      <View style={[styles.decorCircle2, { backgroundColor: step.bgGradientBottom, opacity: 0.3 }]} />

      {/* Top bar: brand + skip/step */}
      <View style={styles.topBar}>
        <View style={styles.topBrand}>
          <View style={styles.topBrandIcon}>
            <Ionicons name="medical" size={14} color={step.bgGradientTop} />
          </View>
          <Text style={styles.topBrandLabel}>MPericias</Text>
        </View>

        {!isLastStep ? (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.skipText}>Pular</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.stepCounter}>
            <Text style={styles.stepCounterText}>
              {currentStep + 1} de {STEPS.length}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon circle */}
        <Animated.View
          style={[
            styles.iconCircle,
            {
              backgroundColor: 'rgba(255,255,255,0.15)',
              transform: [{ scale: iconScale[currentStep] }],
              opacity: fadeAnims[currentStep],
            },
          ]}
        >
          <View style={styles.iconInner}>
            {step.icon}
          </View>
        </Animated.View>

        {/* Tag */}
        <Animated.View
          style={[
            styles.tagWrap,
            {
              opacity: fadeAnims[currentStep],
              transform: [{ translateY: slideAnims[currentStep] }],
            },
          ]}
        >
          <Text style={styles.tag}>{step.tag}</Text>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: fadeAnims[currentStep],
              transform: [{ translateY: slideAnims[currentStep] }],
            },
          ]}
        >
          {step.title}
        </Animated.Text>

        {/* Description */}
        <Animated.Text
          style={[
            styles.description,
            {
              opacity: fadeAnims[currentStep],
              transform: [{ translateY: slideAnims[currentStep] }],
            },
          ]}
        >
          {step.description}
        </Animated.Text>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {STEPS.map((_, i) => {
            const isActive = i === currentStep;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setCurrentStep(i)}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={[
                    styles.dot,
                    isActive && styles.dotActive,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Primary action button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              isLastStep && styles.primaryButtonFinal,
            ]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            {isLastStep ? (
              <View style={styles.finalButtonContent}>
                <Text style={[styles.primaryButtonText, styles.finalButtonText]}>Criar minha conta</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.primaryDarker} />
              </View>
            ) : (
              <View style={styles.nextButtonContent}>
                <Text style={styles.primaryButtonText}>Continuar</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Secondary link */}
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={styles.secondaryLink}>
          <Text style={styles.secondaryLinkText}>
            {isLastStep ? 'Já tenho uma conta' : 'Já tenho uma conta'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorCircle1: {
    position: 'absolute',
    top: -SCREEN_WIDTH * 0.5,
    right: -SCREEN_WIDTH * 0.3,
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: SCREEN_WIDTH * 0.6,
    opacity: 0.2,
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -SCREEN_WIDTH * 0.3,
    left: -SCREEN_WIDTH * 0.4,
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: SCREEN_WIDTH * 0.45,
  },
  topBar: {
    position: 'absolute',
    top: layout.statusBarTop,
    left: spacing.xxl,
    right: spacing.xxl,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBrandIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBrandLabel: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.3,
  },
  skipButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  skipText: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.3,
  },
  stepCounter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stepCounterText: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl + 8,
    paddingTop: layout.statusBarTop + 20,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagWrap: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 18,
  },
  tag: {
    fontSize: 11,
    fontWeight: fontWeight.black,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 32,
    fontWeight: fontWeight.black,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  bottomSection: {
    paddingHorizontal: spacing.xxl + 8,
    paddingBottom: Platform.OS === 'ios' ? 50 : 36,
    alignItems: 'center',
    gap: 18,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.white,
  },
  primaryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill + 6,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    minWidth: SCREEN_WIDTH - 80,
    alignItems: 'center',
  },
  primaryButtonFinal: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.3,
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  finalButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  finalButtonText: {
    color: colors.primaryDarker,
  },
  secondaryLink: {
    paddingVertical: spacing.xs,
  },
  secondaryLinkText: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: 'rgba(255,255,255,0.7)',
  },
});
