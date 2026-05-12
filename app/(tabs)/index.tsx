import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
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
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>PAINEL DO PERITO</Text>
          </View>
          <Text style={styles.heroTitle}>Olá, Dr. Ricardo</Text>
          <Text style={styles.heroSubtitle}>
            Você tem 4 novas nomeações pendentes.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}
          >
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>LAUDOS</Text>
              <Text style={styles.statLabelSmall}>ENTREGUES</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>08</Text>
              <Text style={styles.statLabel}>AGENDADOS</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>03</Text>
              <Text style={styles.statLabel}>PENDENTES</Text>
            </View>
          </ScrollView>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próxima Perícia</Text>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>Ver Agenda</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.caseCard}>
          <View style={styles.caseHeader}>
            <View style={styles.caseIcon}>
              <MaterialCommunityIcons name="briefcase-outline" size={22} color="#4AAFA6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.caseNumber}>Caso #4829-23</Text>
              <Text style={styles.casePatient}>Paciente: Maria Silva Santos</Text>
            </View>
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>URGENTE</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>DATA E HORA</Text>
              <View style={styles.infoValueRow}>
                <Ionicons name="calendar-outline" size={15} color="#4AAFA6" />
                <Text style={styles.infoValue}>Amanhã, 09:30</Text>
              </View>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>LOCALIZAÇÃO</Text>
              <View style={styles.infoValueRow}>
                <Ionicons name="location-outline" size={15} color="#4AAFA6" />
                <Text style={styles.infoValue}>Clínica Central</Text>
              </View>
            </View>
          </View>

          <Text style={styles.caseDescription}>
            Perícia solicitada pela 4ª Vara Federal para avaliação de
            incapacidade laborativa temporária (Ortopedia).
          </Text>

          <TouchableOpacity style={styles.caseButton} activeOpacity={0.85}>
            <Text style={styles.caseButtonText}>Ver Detalhes do Processo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitleSolo}>Ações Rápidas</Text>

        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickCard} activeOpacity={0.85}>
            <View style={styles.quickIcon}>
              <MaterialCommunityIcons name="file-document-edit-outline" size={22} color="#4AAFA6" />
            </View>
            <Text style={styles.quickTitle}>Novo Laudo</Text>
            <Text style={styles.quickSubtitle}>Iniciar preenchimento</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard} activeOpacity={0.85}>
            <View style={styles.quickIcon}>
              <MaterialCommunityIcons name="cloud-upload-outline" size={22} color="#4AAFA6" />
            </View>
            <Text style={styles.quickTitle}>Subir Exames</Text>
            <Text style={styles.quickSubtitle}>PDF, JPG ou PNG</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F8',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#F5F7F8',
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
    borderColor: '#F5F7F8',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#4AAFA6',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#4AAFA6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 18,
  },
  statsRow: {
    gap: 10,
    paddingRight: 8,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minWidth: 96,
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.8,
  },
  statLabelSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A3A36',
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4AAFA6',
  },
  sectionTitleSolo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A3A36',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  caseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  caseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  caseIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caseNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A3A36',
  },
  casePatient: {
    fontSize: 13,
    color: '#687076',
    marginTop: 2,
  },
  urgentBadge: {
    backgroundColor: '#D4F1EC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  urgentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2A8A7D',
    letterSpacing: 0.6,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#F7F9FA',
    borderRadius: 12,
    padding: 12,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A9BA5',
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
    fontWeight: '600',
    color: '#1A3A36',
  },
  caseDescription: {
    fontSize: 13,
    color: '#687076',
    lineHeight: 19,
    marginBottom: 16,
  },
  caseButton: {
    backgroundColor: '#4AAFA6',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caseButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A3A36',
    marginBottom: 3,
  },
  quickSubtitle: {
    fontSize: 12,
    color: '#8A9BA5',
  },
});
