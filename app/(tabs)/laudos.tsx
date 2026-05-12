import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

type Status = 'EM REVISÃO' | 'FINALIZADO' | 'PENDENTE';

type Laudo = {
  id: string;
  caso: string;
  nome: string;
  data: string;
  status: Status;
};

const LAUDOS: Laudo[] = [
  { id: '1', caso: '#4829-23', nome: 'Maria Silva Santos', data: 'Emitido em 12 Out 2023', status: 'EM REVISÃO' },
  { id: '2', caso: '#4835-23', nome: 'João Pereira Alencar', data: 'Emitido em 11 Out 2023', status: 'FINALIZADO' },
  { id: '3', caso: '#4838-23', nome: 'Ana Costa Marinho', data: 'Emitido em 10 Out 2023', status: 'PENDENTE' },
  { id: '4', caso: '#4842-23', nome: 'Roberto Silva Lima', data: 'Emitido em 09 Out 2023', status: 'FINALIZADO' },
  { id: '5', caso: '#4850-23', nome: 'Francisca Oliveira', data: 'Emitido em 08 Out 2023', status: 'EM REVISÃO' },
  { id: '6', caso: '#4855-23', nome: 'Carlos Eduardo Santos', data: 'Emitido em 07 Out 2023', status: 'FINALIZADO' },
];

const FILTERS = ['Todos', 'Aguardando Revisão', 'Finalizados'] as const;
type Filter = (typeof FILTERS)[number];

function statusStyle(status: Status) {
  switch (status) {
    case 'FINALIZADO':
      return { bg: '#D4F1EC', color: '#2A8A7D' };
    case 'EM REVISÃO':
      return { bg: '#D4F1EC', color: '#2A8A7D' };
    case 'PENDENTE':
      return { bg: '#FFF3C4', color: '#A07400' };
  }
}

export default function LaudosScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('Todos');

  const filtered = LAUDOS.filter((l) => {
    if (filter === 'Aguardando Revisão' && l.status !== 'EM REVISÃO') return false;
    if (filter === 'Finalizados' && l.status !== 'FINALIZADO') return false;
    if (search && !l.nome.toLowerCase().includes(search.toLowerCase()) && !l.caso.includes(search)) return false;
    return true;
  });

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
        <Text style={styles.title}>Gerenciador de Laudos</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#A0AEB8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por caso ou paciente..."
            placeholderTextColor="#B0BEC5"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFilter(f)}
                activeOpacity={0.85}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={{ marginTop: 6 }}>
          {filtered.map((laudo) => {
            const s = statusStyle(laudo.status);
            return (
              <TouchableOpacity
                key={laudo.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => router.push(`/laudo/${encodeURIComponent(laudo.caso)}`)}
              >
                <View style={styles.cardIcon}>
                  <MaterialCommunityIcons name="file-document-outline" size={22} color="#4AAFA6" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.caseLabel}>CASO {laudo.caso}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: s.color }]}>
                        {laudo.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.personName}>{laudo.nome}</Text>
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={13} color="#8A9BA5" />
                    <Text style={styles.dateText}>{laudo.data}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C0CBD1" />
              </TouchableOpacity>
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
    paddingBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A3A36',
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E5E8',
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2D3436',
  },
  filtersRow: {
    gap: 10,
    paddingRight: 8,
    paddingBottom: 14,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E5E8',
  },
  filterChipActive: {
    backgroundColor: '#2A8A7D',
    borderColor: '#2A8A7D',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A3A36',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E8F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  caseLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A9BA5',
    letterSpacing: 0.6,
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
  personName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A3A36',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#8A9BA5',
  },
});
