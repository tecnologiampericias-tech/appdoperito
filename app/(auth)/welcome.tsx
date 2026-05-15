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
import { BrandMark } from '@/components/ui';
import { colors, fontWeight, layout, radius, shadow, spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Onboarding steps — baseado em https://mpericias.com.br
// ---------------------------------------------------------------------------
type Step = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tag: string;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    icon: 'shield-check-outline',
    tag: 'ASSESSORIA COMPLETA',
    title: 'A maior assessoria\npericial do Brasil',
    description:
      'Conectamos peritos judiciais e contratantes em todo o território nacional, com suporte desde o cadastro até a entrega do laudo.',
  },
  {
    icon: 'file-document-check-outline',
    tag: 'SEM BUROCRACIA',
    title: 'Nós cuidamos dos\nprazos e documentos',
    description:
      'Gestão completa de prazos processuais, formatação e protocolo de documentos e laudos. Você foca na perícia, nós resolvemos o resto.',
  },
  {
    icon: 'cash-multiple',
    tag: 'RENDA EXTRA',
    title: 'Ganhe com perícias\nem todo o Brasil',
    description:
      'Receba nomeações de tribunais de qualquer estado. Orientamos sobre honorários e acompanhamos o pagamento junto ao tribunal.',
  },
  {
    icon: 'account-group-outline',
    tag: 'INTERMEDIAÇÃO',
    title: 'Comunicação com\ntribunais e advogados',
    description:
      'Fazemos o contato direto com tribunais e advogados, facilitando toda a comunicação e simplificando o processo pericial.',
  },
  {
    icon: 'rocket-launch-outline',
    tag: 'VAMOS COMEÇAR',
    title: 'Crie sua conta\ne faça parte',
    description:
      'Cadastre-se, envie seus documentos e nossa equipe cuidará de todo o processo de habilitação nos tribunais para você.',
  },
];

const STORAGE_KEY = '@mpericias:onboarding_seen';

export default function WelcomeScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const isLastStep = currentStep === STEPS.length - 1;
  const step = STEPS[currentStep];

  // Animate in current step
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    iconScale.setValue(0.6);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 22,
        stiffness: 160,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        damping: 14,
        stiffness: 200,
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
        toValue: 0.94,
        duration: 70,
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

      {/* ── Header teal (igual ao login/signup) ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <BrandMark variant="onPrimary" label="MPericias" />
          <TouchableOpacity
            style={styles.skipPill}
            onPress={handleSkip}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.skipPillText}>
              {isLastStep ? 'Entrar' : 'Pular'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.stepLabel}>
          {currentStep + 1} de {STEPS.length}
        </Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / STEPS.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* ── Card body (fundo claro como login/signup) ── */}
      <View style={styles.body}>
        <View style={styles.card}>
          {/* Icon */}
          <Animated.View
            style={[
              styles.iconCircle,
              {
                transform: [{ scale: iconScale }],
                opacity: fadeAnim,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={step.icon}
              size={36}
              color={colors.primary}
            />
          </Animated.View>

          {/* Tag */}
          <Animated.View
            style={[
              styles.tagWrap,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
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
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
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
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {step.description}
          </Animated.Text>

          {/* Dots */}
          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setCurrentStep(i)}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              >
                <View
                  style={[
                    styles.dot,
                    i === currentStep && styles.dotActive,
                    i < currentStep && styles.dotDone,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[
              styles.ctaButton,
              isLastStep && styles.ctaButtonFinal,
            ]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.ctaText,
                isLastStep && styles.ctaTextFinal,
              ]}
            >
              {isLastStep ? 'Criar minha conta' : 'Continuar'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={isLastStep ? colors.white : colors.white}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Secondary link */}
        <TouchableOpacity
          onPress={handleSkip}
          activeOpacity={0.7}
          style={styles.secondaryLink}
        >
          <Text style={styles.secondaryLinkText}>Já tenho uma conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgGreyMint,
  },

  // ── Header ──
  header: {
    backgroundColor: colors.primary,
    paddingTop: layout.authHeaderTop,
    paddingHorizontal: spacing.xxl,
    paddingBottom: 70,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  skipPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  skipPillText: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.onPrimary90,
    letterSpacing: 0.2,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.onPrimary75,
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.white,
  },

  // ── Body ──
  body: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.hero,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge + 8,
    paddingBottom: spacing.xxl,
    marginTop: -40,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },

  // ── Icon ──
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },

  // ── Tag ──
  tagWrap: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySurface,
    marginBottom: spacing.lg,
  },
  tag: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.primary,
    letterSpacing: 1.4,
  },

  // ── Text ──
  title: {
    fontSize: 26,
    fontWeight: fontWeight.black,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xxl,
  },

  // ── Dots ──
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderSubtle,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  dotDone: {
    backgroundColor: colors.primaryDisabled,
  },

  // ── CTA ──
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.pill + 4,
    paddingVertical: 16,
    minWidth: SCREEN_WIDTH - 64,
    marginTop: spacing.xxl,
    ...shadow.primary,
  },
  ctaButtonFinal: {
    backgroundColor: colors.primaryDarker,
    ...shadow.primaryDark,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.3,
  },
  ctaTextFinal: {
    fontSize: 17,
  },

  // ── Secondary ──
  secondaryLink: {
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
  },
  secondaryLinkText: {
    fontSize: 14,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
});
