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

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [crm, setCrm] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => router.push('/dossie');
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
              label="CRM (REGISTRO MÉDICO)"
              iconLeft="card-account-details-outline"
              placeholder="000000-UF"
              value={crm}
              onChangeText={setCrm}
              autoCapitalize="characters"
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

            <Button
              label="Continuar"
              onPress={handleSignup}
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
});
