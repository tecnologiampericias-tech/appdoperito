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
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/lib/authErrors';

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignup = async () => {
    if (submitting) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const cpfDigits = cpf.replace(/\D/g, '');

    if (!trimmedName || !trimmedEmail || !cpfDigits || !password) {
      setErrorMessage('Preencha todos os campos.');
      return;
    }
    if (cpfDigits.length !== 11) {
      setErrorMessage('CPF inválido. Digite os 11 dígitos.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('A senha deve ter ao menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    const { error } = await signUp({
      fullName: trimmedName,
      cpf: cpfDigits,
      email: trimmedEmail,
      password,
    });
    setSubmitting(false);

    if (error) {
      setErrorMessage(getAuthErrorMessage(error));
      return;
    }
    setSuccessMessage(
      'Conta criada! Enviamos um link de confirmação para seu e-mail. Confirme para acessar.',
    );
  };

  const handleGoToLogin = () => router.replace('/login');
  const handleGoogleSignup = () => {};
  const handleAppleSignup = () => {};

  return (
    <Screen background={colors.primary} statusBar="light">
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
            title="Crie sua conta MPericias"
            subtitle={'Preencha seus dados para ter acesso\ncompleto.'}
          />

          <View style={styles.card}>
            <Input
              label="NOME COMPLETO"
              iconLeft="account-outline"
              placeholder="Seu nome completo"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              containerStyle={styles.field}
            />

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

            <Input
              label="CPF"
              iconLeft="card-account-details-outline"
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={(text) => setCpf(formatCpf(text))}
              keyboardType="number-pad"
              maxLength={14}
              containerStyle={styles.field}
            />

            <PasswordInput
              label="SENHA"
              iconLeft="lock-outline"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              containerStyle={styles.field}
            />

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            {successMessage ? (
              <Text style={styles.successText}>{successMessage}</Text>
            ) : null}

            <Button
              label={successMessage ? 'Ir para o login' : 'Continuar'}
              onPress={successMessage ? handleGoToLogin : handleSignup}
              loading={submitting}
              textStyle={styles.primaryButtonText}
              style={styles.primaryButton}
            />

            <Divider label="OU USE" />

            <View style={styles.socialStack}>
              <GoogleButton label="Cadastrar com Google" onPress={handleGoogleSignup} />
              <AppleButton label="Cadastrar com Apple" onPress={handleAppleSignup} />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já possui acesso? </Text>
            <TouchableOpacity onPress={handleGoToLogin}>
              <Text style={styles.footerLink}>Fazer Login</Text>
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
    marginBottom: 18,
  },
  primaryButton: {
    marginTop: 10,
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
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successText: {
    color: colors.primary,
    fontSize: 13,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
