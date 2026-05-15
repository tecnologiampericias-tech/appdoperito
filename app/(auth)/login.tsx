import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { colors, fontWeight, radius, shadow, spacing } from '@/constants/theme';
import {
  AppleButton,
  AuthHeader,
  Button,
  Divider,
  GoogleButton,
  Input,
  PasswordInput,
  Screen,
  Toast,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/lib/authErrors';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (submitting) return;
    setToastMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setToastMessage('Preencha e-mail e senha.');
      return;
    }

    setSubmitting(true);
    const { error } = await signIn({ email: trimmedEmail, password });

    if (error) {
      setSubmitting(false);
      setToastMessage(getAuthErrorMessage(error));
      return;
    }
    // Sucesso: o AuthProvider detecta a nova sessão e o (auth)/_layout
    // redireciona automaticamente para /(onboarding)/documents ou /(tabs)
    // conforme o status de onboarding do perfil.
  };

  const handleSignUp = () => router.push('/signup');
  const handleForgotPassword = () => {};
  const handleGoogleLogin = () => {};
  const handleAppleLogin = () => {};

  return (
    <Screen background={colors.primary} statusBar="light">
      <Toast
        message={toastMessage}
        variant="error"
        onDismiss={() => setToastMessage(null)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader
            title="Bem-vindo"
            subtitle={'Acesse sua plataforma de perícias médicas\ncom segurança.'}
          />

          <View style={styles.card}>
            <Input
              label="E-MAIL"
              iconLeft="email-outline"
              placeholder="nome@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={styles.field}
            />

            <PasswordInput
              label="SENHA"
              iconLeft="lock-outline"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              containerStyle={styles.field}
              labelRight={
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgot}>Esqueceu?</Text>
                </TouchableOpacity>
              }
            />

            <Button
              label="Entrar"
              onPress={handleLogin}
              loading={submitting}
              textStyle={styles.primaryButtonText}
              style={styles.primaryButton}
            />

            <Divider label="OU" />

            <View style={styles.socialStack}>
              <GoogleButton label="Continuar com Google" onPress={handleGoogleLogin} />
              <AppleButton label="Continuar com Apple" onPress={handleAppleLogin} />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.footerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.huge,
    backgroundColor: colors.bgGreyMint,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.hero,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxxl,
    marginTop: -50,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  field: {
    marginBottom: spacing.xl,
  },
  forgot: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  primaryButton: {
    marginTop: spacing.sm,
    ...shadow.primary,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },
  socialStack: {
    gap: 10,
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
