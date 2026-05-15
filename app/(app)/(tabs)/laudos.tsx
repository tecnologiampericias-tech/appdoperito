import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fontWeight, radius, shadow, spacing } from '@/constants/theme';
import {
  FilterChip,
  IconBadge,
  Screen,
  SearchInput,
  StatusBadge,
  TopBar,
} from '@/components/ui';
import { FILTROS_LAUDOS, LAUDOS, type FiltroLaudo } from '@/data/laudos';
import { laudoStatusVisual } from '@/data/status';
import type { Laudo } from '@/types/domain';

export default function LaudosScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FiltroLaudo>('Todos');

  const filtered = LAUDOS.filter((l) => {
    if (filter === 'Aguardando Revisão' && l.status !== 'EM REVISÃO') return false;
    if (filter === 'Finalizados' && l.status !== 'FINALIZADO') return false;
    if (
      search &&
      !l.nome.toLowerCase().includes(search.toLowerCase()) &&
      !l.caso.includes(search)
    )
      return false;
    return true;
  });

  return (
    <Screen background={colors.bgBlueGrey}>
      <TopBar background={colors.bgBlueGrey} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Gerenciador de Laudos</Text>

        <SearchInput
          placeholder="Buscar por caso ou paciente..."
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.search}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTROS_LAUDOS.map((f) => (
            <FilterChip
              key={f}
              label={f}
              active={filter === f}
              onPress={() => setFilter(f)}
            />
          ))}
        </ScrollView>

        <View style={styles.list}>
          {filtered.map((laudo) => (
            <LaudoRow key={laudo.id} laudo={laudo} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function LaudoRow({ laudo }: { laudo: Laudo }) {
  const visual = laudoStatusVisual(laudo.status);
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/laudo/${encodeURIComponent(laudo.caso)}`)}
    >
      <IconBadge size="lg">
        <MaterialCommunityIcons name="file-document-outline" size={22} color={colors.primary} />
      </IconBadge>
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.caseLabel}>CASO {laudo.caso}</Text>
          <StatusBadge label={laudo.status} bg={visual.bg} color={visual.color} />
        </View>
        <Text style={styles.personName}>{laudo.nome}</Text>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={13} color={colors.textSubtle} />
          <Text style={styles.dateText}>{laudo.data}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.dotMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
  },
  title: {
    fontSize: 26,
    fontWeight: fontWeight.black,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  search: {
    marginBottom: 14,
  },
  filtersRow: {
    gap: 10,
    paddingRight: spacing.sm,
    paddingBottom: 14,
  },
  list: {
    marginTop: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: 14,
    marginBottom: 10,
    ...shadow.card,
  },
  cardBody: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  caseLabel: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.textSubtle,
    letterSpacing: 0.6,
  },
  personName: {
    fontSize: 15,
    fontWeight: fontWeight.black,
    color: colors.text,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSubtle,
  },
});
