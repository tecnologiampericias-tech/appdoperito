import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type Status = 'CONCLUÍDO' | 'AGORA' | 'PRÓXIMO' | 'PENDENTE';

type Evento = {
  id: string;
  hora: string;
  caso: string;
  nome: string;
  tipo: string;
  status: Status;
};

const DIAS = [
  { sigla: 'SEG', num: '12' },
  { sigla: 'TER', num: '13' },
  { sigla: 'QUA', num: '14' },
  { sigla: 'QUI', num: '15' },
  { sigla: 'SEX', num: '16' },
  { sigla: 'SAB', num: '17' },
  { sigla: 'DOM', num: '18' },
];

const EVENTOS: Evento[] = [
  { id: '1', hora: '08:00', caso: '#4920-23', nome: 'Carlos Alberto Souza', tipo: 'Perícia Médica - Geral', status: 'CONCLUÍDO' },
  { id: '2', hora: '09:30', caso: '#4925-23', nome: 'Beatriz Mendonça', tipo: 'Avaliação Funcional', status: 'AGORA' },
  { id: '3', hora: '11:00', caso: '#4930-23', nome: 'Roberto Silva de Assis', tipo: 'Laudo Complementar', status: 'PRÓXIMO' },
  { id: '4', hora: '14:00', caso: '#4938-23', nome: 'Lúcia Ferreira Lima', tipo: 'Exame Admissional', status: 'PENDENTE' },
  { id: '5', hora: '15:30', caso: '', nome: '', tipo: '', status: 'PENDENTE' },
];

function statusStyle(status: Status) {
  switch (status) {
    case 'CONCLUÍDO':
      return { bg: '#D4F1EC', color: '#2A8A7D' };
    case 'PRÓXIMO':
      return { bg: '#D4F1EC', color: '#2A8A7D' };
    case 'PENDENTE':
      return { bg: '#EEF1F3', color: '#687076' };
    case 'AGORA':
      return { bg: '#FFFFFF', color: '#2A8A7D' };
  }
}

export default function AgendaScreen() {
  const [selected, setSelected] = useState('14');

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.brandIcon}>
            <Ionicons name="medical" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.brandText}>Expertise Digital</Text>
        </View>
        <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={22} color="#2D3436" />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

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
          {DIAS.map((d) => {
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
          {EVENTOS.map((e, idx) => {
            const isEmpty = !e.caso;
            const isNow = e.status === 'AGORA';
            const s = statusStyle(e.status);
            const isLast = idx === EVENTOS.length - 1;

            return (
              <View key={e.id} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <Text style={[styles.timeText, isNow && styles.timeTextActive]}>
                    {e.hora}
                  </Text>
                  <View
                    style={[
                      styles.dot,
                      isNow && styles.dotActive,
                      isEmpty && styles.dotEmpty,
                    ]}
                  />
                  {!isLast && <View style={[styles.line, isEmpty && styles.lineDashed]} />}
                </View>

                {isEmpty ? (
                  <View style={styles.emptySlot} />
                ) : (
                  <TouchableOpacity
                    style={[styles.eventCard, isNow && styles.eventCardActive]}
                    activeOpacity={0.9}
                    onPress={() => router.push(`/pericia/${encodeURIComponent(e.caso)}`)}
                  >
                    <View style={styles.eventHeader}>
                      <Text style={[styles.caseLabel, isNow && styles.caseLabelActive]}>
                        CASO {e.caso}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: s.color }]}>
                          {e.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.eventBody}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.personName, isNow && styles.personNameActive]}>
                          {e.nome}
                        </Text>
                        <Text style={[styles.eventType, isNow && styles.eventTypeActive]}>
                          {e.tipo}
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
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF1F3',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#EEF1F3',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#4AAFA6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A3A36',
  },
  bellButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
    borderWidth: 1.5,
    borderColor: '#EEF1F3',
  },
  scrollContent: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A3A36',
  },
  subtitle: {
    fontSize: 14,
    color: '#687076',
    marginTop: 4,
    marginBottom: 18,
  },
  daysRow: {
    gap: 10,
    paddingRight: 8,
    paddingBottom: 20,
  },
  dayCard: {
    width: 56,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E5E8',
    alignItems: 'center',
  },
  dayCardActive: {
    backgroundColor: '#2A8A7D',
    borderColor: '#2A8A7D',
  },
  daySigla: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A9BA5',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  daySiglaActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  dayNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A3A36',
  },
  dayNumActive: {
    color: '#FFFFFF',
  },
  timeline: {
    marginTop: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 100,
  },
  timelineLeft: {
    width: 56,
    alignItems: 'center',
    paddingTop: 4,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#687076',
    marginBottom: 8,
  },
  timeTextActive: {
    color: '#2A8A7D',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C0CBD1',
    marginBottom: 4,
  },
  dotActive: {
    backgroundColor: '#2A8A7D',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotEmpty: {
    backgroundColor: '#D8DEE2',
  },
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
  emptySlot: {
    flex: 1,
    minHeight: 60,
  },
  eventCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  eventCardActive: {
    backgroundColor: '#2A8A7D',
    shadowColor: '#2A8A7D',
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
    fontWeight: '700',
    color: '#8A9BA5',
    letterSpacing: 0.6,
  },
  caseLabelActive: {
    color: 'rgba(255,255,255,0.75)',
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  eventBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A3A36',
    marginBottom: 2,
  },
  personNameActive: {
    color: '#FFFFFF',
  },
  eventType: {
    fontSize: 13,
    color: '#687076',
  },
  eventTypeActive: {
    color: 'rgba(255,255,255,0.85)',
  },
});
