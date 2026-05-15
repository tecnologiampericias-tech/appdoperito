import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fontWeight, radius, shadow, spacing } from '@/constants/theme';
import { AuthHeader, Button, Screen } from '@/components/ui';

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
      'Gestão completa de prazos processuais, formatação e protocolo de documentos. Você foca na perícia, nós resolvemos o resto.',
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
  const slideAnim = useRef(new Animated.Value(20)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;

  const isLastStep = currentStep === STEPS.length - 1;
  const step = STEPS[currentStep];

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
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
  }, [currentStep, fadeAnim, slideAnim, iconScale]);

  const markSeen = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
  }, []);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      markSeen();
      router.replace('/signup');
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [isLastStep, markSeen]);

  const handleSkip = useCallback(() => {
    markSeen();
    router.replace('/login');
  }, [markSeen]);

  return (
    <Screen background={colors.primary} statusBar="light">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <AuthHeader
          title="Bem-vindo"
          subtitle={'Conheça os benefícios da\nplataforma MPericias.'}
        />

        {/* Action bar for skip text on top of the card overlap */}
        <View style={styles.topBar}>
          <Text style={styles.stepText}>
            {currentStep + 1} de {STEPS.length}
          </Text>
          {!isLastStep ? (
            <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.skipText}>Pular</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} /> // spacer to balance flex-between
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardContent}>
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
                  hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
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

            {/* CTA inside card */}
            <Button
              label={isLastStep ? 'Criar minha conta' : 'Continuar'}
              onPress={handleNext}
              textStyle={[
                styles.primaryButtonText,
                isLastStep && { color: colors.white }
              ]}
              style={[
                styles.primaryButton,
                isLastStep && { backgroundColor: colors.primaryDarker }
              ]}
              iconRight="arrow-forward"
            />
          </View>
        </View>

        {/* Footer exactly like login/signup */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Já possui acesso? </Text>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.footerLink}>Fazer Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.huge,
    backgroundColor: colors.bgGreyMint,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: 8,
    marginTop: -80, // pull up into the AuthHeader space
    zIndex: 10,
  },
  stepText: {
    fontSize: 13,
    fontWeight: fontWeight.bold,
    color: colors.onPrimary85,
    letterSpacing: 0.5,
  },
  skipText: {
    fontSize: 14,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.hero,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    marginTop: 8, // offset relative to the top bar
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  cardContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
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
  title: {
    fontSize: 24,
    fontWeight: fontWeight.black,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xxl,
    minHeight: 66, // prevents layout jump between steps
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xl,
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
  primaryButton: {
    width: '100%',
    ...shadow.primary,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
});
