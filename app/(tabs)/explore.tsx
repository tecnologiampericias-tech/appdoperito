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

type Solicitacao = {
  id: string;
  numero: string;
  tipo: 'JUSTIÇA COMUM' | 'TRABALHISTA' | 'PREVIDENCIÁRIO';
  nome: string;
  processo: string;
  data: string;
  local: string;
  localIcon: 'location' | 'medical';
};

const SOLICITACOES: Solicitacao[] = [
  {
    id: '1',
    numero: '#142-2024',
    tipo: 'JUSTIÇA COMUM',
    nome: 'Ricardo Oliveira Santos',
    processo: '5001245-12.2024.8.21.0001',
    data: '15 de Maio, 2024 às 14:30',
    local: 'Vara Cível de Porto Alegre - Sala 402',
    localIcon: 'location',
  },
  {
    id: '2',
    numero: '#145-2024',
    tipo: 'TRABALHISTA',
    nome: 'Beatriz Mendes Farias',
    processo: '0020456-77.2023.5.04.0012',
    data: '18 de Maio, 2024 às 09:00',
    local: 'Clínica MedExpert - Unidade Centro',
    localIcon: 'medical',
  },
  {
    id: '3',
    numero: '#150-2024',
    tipo: 'PREVIDENCIÁRIO',
    nome: 'Carlos Eduardo Braga',
    processo: '5009876-45.2024.4.03.6100',
    data: '22 de Maio, 2024 às 11:15',
    local: 'Agência INSS - Centro',
    localIcon: 'location',
  },
];

export default function NomeacoesScreen() {
  const [search, setSearch] = useState('');

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
        <Text style={styles.title}>Novas Nomeações</Text>
        <Text style={styles.subtitle}>
          Gerencie suas perícias pendentes de aceitação.
        </Text>

        <View style={styles.searchGroup}>
          <Text style={styles.searchLabel}>BUSCAR POR PROCESSO OU NOME</Text>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#A0AEB8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ex: 5002431-88.2023..."
              placeholderTextColor="#B0BEC5"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {SOLICITACOES.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{item.tipo}</Text>
              </View>
              <Text style={styles.caseNumber}>{item.numero}</Text>
            </View>

            <Text style={styles.personName}>{item.nome}</Text>
            <Text style={styles.processText}>Processo: {item.processo}</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar-outline" size={18} color="#4AAFA6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>DATA E HORA</Text>
                <Text style={styles.infoValue}>{item.data}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                {item.localIcon === 'medical' ? (
                  <MaterialCommunityIcons name="medical-bag" size={18} color="#4AAFA6" />
                ) : (
                  <Ionicons name="location-outline" size={18} color="#4AAFA6" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>LOCAL</Text>
                <Text style={styles.infoValue}>{item.local}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.refuseButton} activeOpacity={0.85}>
                <Text style={styles.refuseButtonText}>Recusar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} activeOpacity={0.85}>
                <Text style={styles.acceptButtonText}>Aceitar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    fontSize: 28,
    fontWeight: '800',
    color: '#1A3A36',
  },
  subtitle: {
    fontSize: 14,
    color: '#687076',
    marginTop: 6,
    lineHeight: 20,
  },
  searchGroup: {
    marginTop: 22,
    marginBottom: 18,
  },
  searchLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A9BA5',
    letterSpacing: 0.8,
    marginBottom: 8,
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
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2D3436',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: '#D4F1EC',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2A8A7D',
    letterSpacing: 0.6,
  },
  caseNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2A8A7D',
  },
  personName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A3A36',
    marginBottom: 4,
  },
  processText: {
    fontSize: 13,
    color: '#687076',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E8F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A9BA5',
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A3A36',
    lineHeight: 19,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  refuseButton: {
    flex: 1,
    backgroundColor: '#EEF1F3',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refuseButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#687076',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#2A8A7D',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
