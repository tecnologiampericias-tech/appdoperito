import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

type SectionKey = 'achados' | 'conclusao' | 'historico';

export default function LaudoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState('');
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    achados: true,
    conclusao: true,
    historico: false,
  });

  const toggle = (key: SectionKey) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#1A3A36" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Laudo {id ?? '#4829-23'}</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={22} color="#1A3A36" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.metaRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>EM REVISÃO</Text>
            </View>
            <Text style={styles.metaDate}>Emitido em 12 Out 2023</Text>
          </View>

          <Text style={styles.patientName}>Maria Silva Santos</Text>
          <View style={styles.examRow}>
            <MaterialCommunityIcons name="head-snowflake-outline" size={16} color="#4AAFA6" />
            <Text style={styles.examText}>Ressonância Magnética de Crânio</Text>
          </View>

          <TouchableOpacity style={styles.approveButton} activeOpacity={0.88}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.approveButtonText}>Aprovar Laudo</Text>
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85}>
              <MaterialCommunityIcons name="file-document-edit-outline" size={22} color="#1A3A36" />
              <Text style={styles.secondaryButtonText}>Revisar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85}>
              <MaterialCommunityIcons name="file-pdf-box" size={22} color="#1A3A36" />
              <Text style={styles.secondaryButtonText}>Baixar PDF</Text>
            </TouchableOpacity>
          </View>

          <CollapsibleSection
            icon={<Ionicons name="eye-outline" size={18} color="#1A3A36" />}
            title="Achados Detalhados"
            open={open.achados}
            onToggle={() => toggle('achados')}
          >
            <Text style={styles.paragraph}>
              Presença de áreas com sinal hiperintenso em T2 e FLAIR na substância
              branca periventricular, compatível com microangiopatia degenerativa.
            </Text>
            <Text style={styles.paragraph}>
              Sistema ventricular de forma, volume e topografia normais. Estruturas
              da linha média em posição habitual.
            </Text>
          </CollapsibleSection>

          <CollapsibleSection
            icon={<MaterialCommunityIcons name="clipboard-pulse-outline" size={18} color="#1A3A36" />}
            title="Conclusão Diagnóstica"
            open={open.conclusao}
            onToggle={() => toggle('conclusao')}
          >
            <Text style={styles.paragraph}>
              Exame apresentando sinais de leucoencefalopatia de provável etiologia
              vascular grau II de Fazekas.
            </Text>
          </CollapsibleSection>

          <CollapsibleSection
            icon={<Ionicons name="time-outline" size={18} color="#1A3A36" />}
            title="Histórico do Paciente"
            open={open.historico}
            onToggle={() => toggle('historico')}
          >
            <Text style={styles.paragraph}>
              Paciente com histórico de hipertensão arterial sistêmica em uso regular
              de losartana. Sem outras comorbidades relevantes.
            </Text>
          </CollapsibleSection>
        </ScrollView>

        <View style={styles.noteBar}>
          <TextInput
            style={styles.noteInput}
            placeholder="Adicionar nota rápida para revisão..."
            placeholderTextColor="#A0AEB8"
            value={note}
            onChangeText={setNote}
          />
          <TouchableOpacity style={styles.sendButton} activeOpacity={0.85}>
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function CollapsibleSection({
  icon,
  title,
  open,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={onToggle} activeOpacity={0.75}>
        <View style={styles.sectionHeaderLeft}>
          {icon}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#687076"
        />
      </TouchableOpacity>
      {open && <View style={styles.sectionBody}>{children}</View>}
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
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: '#F5F7F8',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A3A36',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#D4F1EC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2A8A7D',
    letterSpacing: 0.6,
  },
  metaDate: {
    fontSize: 13,
    color: '#687076',
  },
  patientName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A3A36',
    marginBottom: 4,
  },
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  examText: {
    fontSize: 14,
    color: '#687076',
    fontWeight: '500',
  },
  approveButton: {
    backgroundColor: '#2A8A7D',
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2A8A7D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 18,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A3A36',
  },
  section: {
    backgroundColor: '#EEF1F3',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A3A36',
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  paragraph: {
    fontSize: 13,
    color: '#5A6670',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF1F3',
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#F5F7F8',
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 44,
    fontSize: 14,
    color: '#1A3A36',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4AAFA6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
