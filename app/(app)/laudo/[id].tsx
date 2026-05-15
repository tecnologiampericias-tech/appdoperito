import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, fontWeight, layout, radius, shadow, spacing } from '@/constants/theme';
import { Button, HeaderBar, Screen, StatusBadge } from '@/components/ui';

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
    <Screen background={colors.bgGreyLight}>
      <HeaderBar
        variant="compact"
        onBack={() => router.back()}
        title={`Laudo ${id ?? '#4829-23'}`}
        rightSlot={
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="share-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.metaRow}>
            <StatusBadge label="EM REVISÃO" tone="info" />
            <Text style={styles.metaDate}>Emitido em 12 Out 2023</Text>
          </View>

          <Text style={styles.patientName}>Maria Silva Santos</Text>
          <View style={styles.examRow}>
            <MaterialCommunityIcons name="head-snowflake-outline" size={16} color={colors.primary} />
            <Text style={styles.examText}>Ressonância Magnética de Crânio</Text>
          </View>

          <Button
            label="Aprovar Laudo"
            variant="primaryDark"
            iconLeft={<Ionicons name="checkmark-circle" size={20} color={colors.white} />}
            textStyle={styles.approveText}
          />

          <View style={styles.secondaryRow}>
            <SecondaryAction icon="file-document-edit-outline" label="Revisar" />
            <SecondaryAction icon="file-pdf-box" label="Baixar PDF" />
          </View>

          <CollapsibleSection
            icon={<Ionicons name="eye-outline" size={18} color={colors.text} />}
            title="Achados Detalhados"
            open={open.achados}
            onToggle={() => toggle('achados')}
          >
            <Text style={styles.paragraph}>
              Presença de áreas com sinal hiperintenso em T2 e FLAIR na substância branca
              periventricular, compatível com microangiopatia degenerativa.
            </Text>
            <Text style={styles.paragraph}>
              Sistema ventricular de forma, volume e topografia normais. Estruturas da linha
              média em posição habitual.
            </Text>
          </CollapsibleSection>

          <CollapsibleSection
            icon={<MaterialCommunityIcons name="clipboard-pulse-outline" size={18} color={colors.text} />}
            title="Conclusão Diagnóstica"
            open={open.conclusao}
            onToggle={() => toggle('conclusao')}
          >
            <Text style={styles.paragraph}>
              Exame apresentando sinais de leucoencefalopatia de provável etiologia vascular grau
              II de Fazekas.
            </Text>
          </CollapsibleSection>

          <CollapsibleSection
            icon={<Ionicons name="time-outline" size={18} color={colors.text} />}
            title="Histórico do Paciente"
            open={open.historico}
            onToggle={() => toggle('historico')}
          >
            <Text style={styles.paragraph}>
              Paciente com histórico de hipertensão arterial sistêmica em uso regular de
              losartana. Sem outras comorbidades relevantes.
            </Text>
          </CollapsibleSection>
        </ScrollView>

        <View style={styles.noteBar}>
          <TextInput
            style={styles.noteInput}
            placeholder="Adicionar nota rápida para revisão..."
            placeholderTextColor={colors.textPlaceholder}
            value={note}
            onChangeText={setNote}
          />
          <TouchableOpacity style={styles.sendButton} activeOpacity={0.85}>
            <Ionicons name="send" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function SecondaryAction({
  icon,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}) {
  return (
    <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.text} />
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </TouchableOpacity>
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
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    marginBottom: spacing.sm,
  },
  metaDate: {
    fontSize: 13,
    color: colors.textMuted,
  },
  patientName: {
    fontSize: 26,
    fontWeight: fontWeight.black,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  examText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  approveText: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: 18,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    ...shadow.card,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  section: {
    backgroundColor: colors.bgBlueGrey,
    borderRadius: radius.xxl,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: fontWeight.black,
    color: colors.text,
  },
  sectionBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 14,
  },
  paragraph: {
    fontSize: 13,
    color: colors.textSoft,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  noteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: layout.iosBottomSafeSm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.bgBlueGrey,
  },
  noteInput: {
    flex: 1,
    backgroundColor: colors.bgGreyLight,
    borderRadius: 22,
    paddingHorizontal: spacing.lg,
    height: 44,
    fontSize: 16,
    color: colors.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
