import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontWeight, spacing } from '@/constants/theme';
import {
  Button,
  Card,
  Eyebrow,
  IconBadge,
  Screen,
  SearchInput,
  StatusBadge,
  TopBar,
} from '@/components/ui';
import { SOLICITACOES } from '@/data/solicitacoes';
import type { Solicitacao } from '@/types/domain';

export default function NomeacoesScreen() {
  const [search, setSearch] = useState('');

  return (
    <Screen background={colors.bgBlueGrey}>
      <TopBar background={colors.bgBlueGrey} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Novas Nomeações</Text>
        <Text style={styles.subtitle}>
          Gerencie suas perícias pendentes de aceitação.
        </Text>

        <View style={styles.searchGroup}>
          <Eyebrow>BUSCAR POR PROCESSO OU NOME</Eyebrow>
          <SearchInput
            placeholder="Ex: 5002431-88.2023..."
            value={search}
            onChangeText={setSearch}
            containerStyle={styles.searchBox}
          />
        </View>

        {SOLICITACOES.map((item) => (
          <SolicitacaoCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </Screen>
  );
}

function SolicitacaoCard({ item }: { item: Solicitacao }) {
  return (
    <Card elevation="high" style={styles.card}>
      <View style={styles.cardHeader}>
        <StatusBadge label={item.tipo} tone="success" size="md" />
        <Text style={styles.caseNumber}>{item.numero}</Text>
      </View>

      <Text style={styles.personName}>{item.nome}</Text>
      <Text style={styles.processText}>Processo: {item.processo}</Text>

      <InfoRow icon={<Ionicons name="calendar-outline" size={18} color={colors.primary} />} label="DATA E HORA" value={item.data} />
      <InfoRow
        icon={
          item.localIcon === 'medical' ? (
            <MaterialCommunityIcons name="medical-bag" size={18} color={colors.primary} />
          ) : (
            <Ionicons name="location-outline" size={18} color={colors.primary} />
          )
        }
        label="LOCAL"
        value={item.local}
      />

      <View style={styles.actions}>
        <Button label="Recusar" variant="secondary" size="md" style={styles.actionBtn} />
        <Button label="Aceitar" variant="primaryDark" size="md" style={styles.actionBtn} />
      </View>
    </Card>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <IconBadge size="sm" tone="mint">
        {icon}
      </IconBadge>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
  },
  title: {
    fontSize: 28,
    fontWeight: fontWeight.black,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  searchGroup: {
    marginTop: 22,
    marginBottom: 18,
  },
  searchBox: {
    marginTop: spacing.sm,
  },
  card: {
    marginBottom: 14,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  caseNumber: {
    fontSize: 13,
    fontWeight: fontWeight.bold,
    color: colors.primaryDark,
  },
  personName: {
    fontSize: 18,
    fontWeight: fontWeight.black,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  processText: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoTextWrap: { flex: 1 },
  infoLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textSubtle,
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});
