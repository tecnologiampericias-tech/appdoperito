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
import { router, useLocalSearchParams } from 'expo-router';

type PassoState = 'done' | 'current' | 'pending';

type Passo = {
  numero: number;
  titulo: string;
  icon: React.ReactNode;
  state: PassoState;
};

const PASSOS: Passo[] = [
  {
    numero: 1,
    titulo: 'Validar Identidade',
    icon: <MaterialCommunityIcons name="account-search-outline" size={22} color="#2A8A7D" />,
    state: 'done',
  },
  {
    numero: 2,
    titulo: 'Coletar Anamnese',
    icon: <MaterialCommunityIcons name="clipboard-text-outline" size={22} color="#2A8A7D" />,
    state: 'current',
  },
  {
    numero: 3,
    titulo: 'Emitir Parecer',
    icon: <MaterialCommunityIcons name="file-document-edit-outline" size={22} color="#A0AEB8" />,
    state: 'pending',
  },
];

export default function PericiaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="close" size={22} color="#1A3A36" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.topSubtitle}>CENTRAL DE AÇÃO</Text>
          <Text style={styles.topTitle}>Caso {id ?? '#4925-23'}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={20} color="#1A3A36" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>AGUARDANDO INÍCIO</Text>
            </View>
            <Text style={styles.heroTime}>Hoje, 09:30</Text>
          </View>
          <Text style={styles.heroName}>Beatriz Mendonça</Text>
          <Text style={styles.heroMeta}>Avaliação Funcional • Unidade Centro</Text>
        </View>

        <Text style={styles.sectionLabel}>ROTEIRO DA PERÍCIA</Text>

        <View style={{ gap: 10 }}>
          {PASSOS.map((passo) => {
            const isCurrent = passo.state === 'current';
            const isDone = passo.state === 'done';
            const isPending = passo.state === 'pending';

            return (
              <View
                key={passo.numero}
                style={[styles.stepCard, isCurrent && styles.stepCardCurrent]}
              >
                <View
                  style={[
                    styles.stepIcon,
                    isPending && styles.stepIconPending,
                  ]}
                >
                  {passo.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.stepLabel,
                      isCurrent && styles.stepLabelCurrent,
                      isPending && styles.stepLabelPending,
                    ]}
                  >
                    {isCurrent ? 'ATUAL' : `PASSO ${passo.numero}`}
                  </Text>
                  <Text
                    style={[
                      styles.stepTitle,
                      isPending && styles.stepTitlePending,
                    ]}
                  >
                    {passo.titulo}
                  </Text>
                </View>
                {isDone && (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>DOCUMENTOS</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="attach" size={15} color="#4AAFA6" />
              <Text style={styles.infoValue}>4 anexos</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>LOCALIZAÇÃO</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="location-outline" size={15} color="#4AAFA6" />
              <Text style={styles.infoValue}>Consultório 04</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.88}>
          <Text style={styles.primaryButtonText}>INICIAR PERÍCIA</Text>
          <Ionicons name="play" size={14} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.7}>
          <Text style={styles.secondaryActionText}>REAGENDAR AVALIAÇÃO</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F5F7F8',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF1F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A9BA5',
    letterSpacing: 1,
  },
  topTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A8A7D',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heroCard: {
    backgroundColor: '#2A8A7D',
    borderRadius: 20,
    padding: 20,
    marginTop: 4,
    marginBottom: 22,
    shadowColor: '#2A8A7D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.7,
  },
  heroTime: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  heroName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroMeta: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A9BA5',
    letterSpacing: 1,
    marginBottom: 10,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  stepCardCurrent: {
    borderColor: '#2A8A7D',
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconPending: {
    backgroundColor: '#EEF1F3',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A9BA5',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  stepLabelCurrent: {
    color: '#2A8A7D',
  },
  stepLabelPending: {
    color: '#A0AEB8',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A3A36',
  },
  stepTitlePending: {
    color: '#8A9BA5',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#A0AEB8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  infoItem: {
    flex: 1,
    paddingHorizontal: 18,
  },
  infoDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#EEF1F3',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A9BA5',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A3A36',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    backgroundColor: '#F5F7F8',
    borderTopWidth: 1,
    borderTopColor: '#EEF1F3',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#2A8A7D',
    borderRadius: 16,
    height: 54,
    shadowColor: '#2A8A7D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  secondaryAction: {
    alignItems: 'center',
    paddingTop: 16,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A9BA5',
    letterSpacing: 1,
  },
});
