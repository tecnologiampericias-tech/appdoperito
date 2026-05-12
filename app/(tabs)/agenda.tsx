import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fontWeight, radius, shadow, spacing } from '@/constants/theme';
import { Screen, StatusBadge, TopBar } from '@/components/ui';
import { DIAS_SEMANA, EVENTOS } from '@/data/agenda';
import { periciaStatusVisual } from '@/data/status';
import type { Evento } from '@/types/domain';

export default function AgendaScreen() {
  const [selected, setSelected] = useState('14');

  return (
    <Screen background={colors.bgBlueGrey}>
      <TopBar background={colors.bgBlueGrey} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Agenda Diária</Text>
        <Text style={styles.subtitle}>Gerencie suas perícias de hoje</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysRow}
        >
          {DIAS_SEMANA.map((d) => {
            const active = selected === d.num;
            return (
              <TouchableOpacity
                key={d.num}
                style={[styles.dayCard, active && styles.dayCardActive]}
                onPress={() => setSelected(d.num)}
                activeOpacity={0.85}
              >
                <Text style={[styles.daySigla, active && styles.daySiglaActive]}>{d.sigla}</Text>
                <Text style={[styles.dayNum, active && styles.dayNumActive]}>{d.num}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.timeline}>
          {EVENTOS.map((e, idx) => (
            <TimelineRow key={e.id} evento={e} isLast={idx === EVENTOS.length - 1} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function TimelineRow({ evento, isLast }: { evento: Evento; isLast: boolean }) {
  const isEmpty = !evento.caso;
  const isNow = evento.status === 'AGORA';
  const visual = periciaStatusVisual(evento.status);

  return (
    <View style={styles.row}>
      <View style={styles.leftRail}>
        <Text style={[styles.time, isNow && styles.timeActive]}>{evento.hora}</Text>
        <View
          style={[styles.dot, isNow && styles.dotActive, isEmpty && styles.dotEmpty]}
        />
        {!isLast && <View style={[styles.line, isEmpty && styles.lineDashed]} />}
      </View>

      {isEmpty ? (
        <View style={styles.emptySlot} />
      ) : (
        <TouchableOpacity
          style={[styles.eventCard, isNow && styles.eventCardActive]}
          activeOpacity={0.9}
          onPress={() => router.push(`/pericia/${encodeURIComponent(evento.caso)}`)}
        >
          <View style={styles.eventHeader}>
            <Text style={[styles.caseLabel, isNow && styles.caseLabelActive]}>
              CASO {evento.caso}
            </Text>
            <StatusBadge label={evento.status} bg={visual.bg} color={visual.color} />
          </View>
          <View style={styles.eventBody}>
            <View style={styles.eventTextWrap}>
              <Text style={[styles.personName, isNow && styles.onPrimary]}>{evento.nome}</Text>
              <Text style={[styles.eventType, isNow && styles.eventTypeActive]}>
                {evento.tipo}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isNow ? 'rgba(255,255,255,0.8)' : '#C0CBD1'}
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: fontWeight.black,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: 18,
  },
  daysRow: {
    gap: 10,
    paddingRight: spacing.sm,
    paddingBottom: spacing.xl,
  },
  dayCard: {
    width: 56,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
  },
  dayCardActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  daySigla: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.textSubtle,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  daySiglaActive: { color: colors.onPrimary75 },
  dayNum: {
    fontSize: 18,
    fontWeight: fontWeight.black,
    color: colors.text,
  },
  dayNumActive: { color: colors.white },
  timeline: { marginTop: spacing.xs },
  row: {
    flexDirection: 'row',
    minHeight: 100,
  },
  leftRail: {
    width: 56,
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  time: {
    fontSize: 13,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  timeActive: { color: colors.primaryDark },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C0CBD1',
    marginBottom: spacing.xs,
  },
  dotActive: {
    backgroundColor: colors.primaryDark,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotEmpty: { backgroundColor: '#D8DEE2' },
  line: {
    flex: 1,
    width: 1.5,
    backgroundColor: '#D8DEE2',
    marginTop: 2,
  },
  lineDashed: {
    backgroundColor: 'transparent',
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D8DEE2',
  },
  emptySlot: { flex: 1, minHeight: 60 },
  eventCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 14,
    marginBottom: 18,
    ...shadow.card,
  },
  eventCardActive: {
    backgroundColor: colors.primaryDark,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  caseLabel: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.textSubtle,
    letterSpacing: 0.6,
  },
  caseLabelActive: { color: colors.onPrimary75 },
  eventBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTextWrap: { flex: 1 },
  personName: {
    fontSize: 15,
    fontWeight: fontWeight.black,
    color: colors.text,
    marginBottom: 2,
  },
  onPrimary: { color: colors.white },
  eventType: {
    fontSize: 13,
    color: colors.textMuted,
  },
  eventTypeActive: { color: colors.onPrimary85 },
});
