import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, IconBadge, Screen } from '@/components/ui';
import { colors, fontWeight, spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function OnboardingDocumentsScreen() {
  const { user, onboarding, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Screen background={colors.bgGreyMint} statusBar="dark">
      <ScrollView contentContainerStyle={styles.content}>
        <IconBadge size="xl" tone="mintSoft" style={styles.icon}>
          <MaterialCommunityIcons name="file-document-multiple-outline" size={28} color={colors.primary} />
        </IconBadge>

        <Text style={styles.title}>Complete sua documentação</Text>
        <Text style={styles.subtitle}>
          Olá{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}!
          Para liberar o app, envie todos os documentos obrigatórios. A tela completa de envio chega no
          próximo passo desta entrega.
        </Text>

        {onboarding ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Progresso atual</Text>
            <Text style={styles.statusLine}>
              {onboarding.approvedCount + onboarding.underReviewCount} de {onboarding.requiredTotal} obrigatórios já
              enviados
            </Text>
            <Text style={styles.statusLine}>Pendentes: {onboarding.pendingCount}</Text>
            <Text style={styles.statusLine}>Em análise: {onboarding.underReviewCount}</Text>
            <Text style={styles.statusLine}>Aprovados: {onboarding.approvedCount}</Text>
            <Text style={styles.statusLine}>Rejeitados: {onboarding.rejectedCount}</Text>
          </View>
        ) : null}

        <Button
          label="Sair da conta"
          variant="outlineMint"
          size="md"
          onPress={handleSignOut}
          loading={signingOut}
          style={styles.signOut}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.huge,
    alignItems: 'flex-start',
  },
  icon: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: fontWeight.black,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.xxl,
  },
  statusCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    gap: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  statusLine: {
    fontSize: 13,
    color: colors.textBody,
  },
  signOut: {
    alignSelf: 'stretch',
  },
});
