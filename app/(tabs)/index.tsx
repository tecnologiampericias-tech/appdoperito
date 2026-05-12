import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontWeight, radius, shadow, spacing } from '@/constants/theme';
import {
  Button,
  Card,
  IconBadge,
  Screen,
  SectionHeader,
  StatusBadge,
  TopBar,
} from '@/components/ui';

export default function HomeScreen() {
  return (
    <Screen background={colors.bgGreyLight}>
      <TopBar background={colors.bgGreyLight} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <StatusBadge
            label="PAINEL DO PERITO"
            bg={colors.onPrimary18}
            color={colors.white}
            size="md"
          />
          <Text style={styles.heroTitle}>Olá, Dr. Ricardo</Text>
          <Text style={styles.heroSubtitle}>Você tem 4 novas nomeações pendentes.</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}
          >
            <Stat value="12" label="LAUDOS" labelSm="ENTREGUES" />
            <Stat value="08" label="AGENDADOS" />
            <Stat value="03" label="PENDENTES" />
          </ScrollView>
        </View>

        <SectionHeader title="Próxima Perícia" actionLabel="Ver Agenda" />

        <Card>
          <View style={styles.caseHeader}>
            <IconBadge size="lg">
              <MaterialCommunityIcons name="briefcase-outline" size={22} color={colors.primary} />
            </IconBadge>
            <View style={styles.caseHeaderText}>
              <Text style={styles.caseNumber}>Caso #4829-23</Text>
              <Text style={styles.casePatient}>Paciente: Maria Silva Santos</Text>
            </View>
            <StatusBadge label="URGENTE" tone="success" />
          </View>

          <View style={styles.infoRow}>
            <InfoBox label="DATA E HORA" icon="calendar-outline" value="Amanhã, 09:30" />
            <InfoBox label="LOCALIZAÇÃO" icon="location-outline" value="Clínica Central" />
          </View>

          <Text style={styles.caseDescription}>
            Perícia solicitada pela 4ª Vara Federal para avaliação de incapacidade laborativa
            temporária (Ortopedia).
          </Text>

          <Button label="Ver Detalhes do Processo" size="md" />
        </Card>

        <Text style={styles.sectionSolo}>Ações Rápidas</Text>

        <View style={styles.quickRow}>
          <QuickAction icon="file-document-edit-outline" title="Novo Laudo" subtitle="Iniciar preenchimento" />
          <QuickAction icon="cloud-upload-outline" title="Subir Exames" subtitle="PDF, JPG ou PNG" />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Stat({ value, label, labelSm }: { value: string; label: string; labelSm?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {labelSm ? <Text style={styles.statLabel}>{labelSm}</Text> : null}
    </View>
  );
}

function InfoBox({
  label,
  icon,
  value,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueRow}>
        <Ionicons name={icon} size={15} color={colors.primary} />
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function QuickAction({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <TouchableOpacity style={styles.quickCard} activeOpacity={0.85}>
      <IconBadge size="md" style={styles.quickIcon}>
        <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
      </IconBadge>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.modal,
    padding: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: fontWeight.black,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.onPrimary85,
    marginBottom: 18,
  },
  statsRow: {
    gap: 10,
    paddingRight: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.onPrimary14,
    borderRadius: radius.xl,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: 18,
    minWidth: 96,
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: fontWeight.black,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.onPrimary90,
    letterSpacing: 0.8,
  },
  sectionSolo: {
    fontSize: 18,
    fontWeight: fontWeight.black,
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  caseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: 14,
  },
  caseHeaderText: { flex: 1 },
  caseNumber: {
    fontSize: 15,
    fontWeight: fontWeight.black,
    color: colors.text,
  },
  casePatient: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  infoBox: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textSubtle,
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  caseDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    ...shadow.card,
  },
  quickIcon: {
    marginBottom: spacing.md,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 3,
  },
  quickSubtitle: {
    fontSize: 12,
    color: colors.textSubtle,
  },
});
