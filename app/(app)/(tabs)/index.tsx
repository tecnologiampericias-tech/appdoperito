import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, fontWeight, radius, shadow, spacing } from '@/constants/theme';
import {
  IconBadge,
  Screen,
  SectionHeader,
  StatusBadge,
  TopBar,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { HOME_QUICK_FAQ } from '@/data/faq';

function getFirstName(fullName?: string | null) {
  if (!fullName) return '';
  return fullName.trim().split(/\s+/)[0] ?? '';
}

export default function HomeScreen() {
  const { user } = useAuth();
  const firstName = getFirstName(user?.user_metadata?.full_name as string | undefined);
  const greeting = firstName ? `Olá, ${firstName}` : 'Olá';

  const openMiaChat = () => router.push('/(app)/chat-ia');
  const askMia = (question: string) =>
    router.push({ pathname: '/(app)/chat-ia', params: { q: question } });

  return (
    <Screen background={colors.bgGreyLight}>
      <TopBar background={colors.bgGreyLight} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <StatusBadge
            label="PAINEL DO PERITO"
            bg={colors.onPrimary18}
            color={colors.white}
            size="md"
          />
          <Text style={styles.heroTitle}>{greeting}</Text>
          <Text style={styles.heroSubtitle}>Você tem 4 novas nomeações pendentes.</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}
          >
            <Stat value="12" label="LAUDOS" labelSm="ENTREGUES" />
            <Stat value="08" label="AGENDADOS" />
            <Stat value="03" label="PENDENTES" />
          </ScrollView>
        </View>

        <SectionHeader
          title="Pergunte para a Mia"
          actionLabel="Abrir chat"
          onAction={openMiaChat}
        />

        <TouchableOpacity
          style={styles.miaCard}
          activeOpacity={0.92}
          onPress={openMiaChat}
        >
          <View style={styles.miaHeader}>
            <View style={styles.miaAvatar}>
              <MaterialCommunityIcons name="robot-happy" size={22} color={colors.white} />
              <View style={styles.miaAvatarDot} />
            </View>
            <View style={styles.miaHeaderText}>
              <Text style={styles.miaEyebrow}>ASSISTENTE IA · ONLINE</Text>
              <Text style={styles.miaTitle}>Mia responde em segundos</Text>
              <Text style={styles.miaSubtitle}>
                Tire dúvidas sobre nomeações, laudos e pagamentos.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textPlaceholder} />
          </View>

          <View style={styles.faqList}>
            {HOME_QUICK_FAQ.map((question, idx) => (
              <FaqQuickRow
                key={question}
                question={question}
                withDivider={idx > 0}
                onPress={() => askMia(question)}
              />
            ))}
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionSolo}>Ações Rápidas</Text>

        <View style={styles.quickRow}>
          <QuickAction icon="file-document-edit-outline" title="Novo Laudo" subtitle="Iniciar preenchimento" />
          <QuickAction icon="cloud-upload-outline" title="Subir Exames" subtitle="PDF, JPG ou PNG" />
        </View>
      </ScrollView>
    </Screen>
  );
}

function FaqQuickRow({
  question,
  withDivider,
  onPress,
}: {
  question: string;
  withDivider: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.faqRow, withDivider && styles.faqRowDivider]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color={colors.primary} />
      <Text style={styles.faqQuestion} numberOfLines={2}>
        {question}
      </Text>
      <Ionicons name="chevron-forward" size={14} color={colors.textPlaceholder} />
    </TouchableOpacity>
  );
}

function Stat({ value, label, labelSm }: { value: string; label: string; labelSm?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {labelSm ? <Text style={styles.statLabel}>{labelSm}</Text> : null}
    </View>
  );
}

function QuickAction({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <TouchableOpacity style={styles.quickCard} activeOpacity={0.85}>
      <IconBadge size="md" style={styles.quickIcon}>
        <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
      </IconBadge>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.modal,
    padding: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: fontWeight.black,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.onPrimary85,
    marginBottom: 18,
  },
  statsRow: {
    gap: 10,
    paddingRight: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.onPrimary14,
    borderRadius: radius.xl,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: 18,
    minWidth: 96,
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: fontWeight.black,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.onPrimary90,
    letterSpacing: 0.8,
  },
  sectionSolo: {
    fontSize: 18,
    fontWeight: fontWeight.black,
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  miaCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg + 2,
    ...shadow.card,
  },
  miaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  miaAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.primary,
  },
  miaAvatarDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.onlineDot,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  miaHeaderText: {
    flex: 1,
    gap: 2,
  },
  miaEyebrow: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.primary,
    letterSpacing: 1.1,
  },
  miaTitle: {
    fontSize: 15,
    fontWeight: fontWeight.black,
    color: colors.text,
  },
  miaSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  faqList: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  faqRowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    lineHeight: 18,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    ...shadow.card,
  },
  quickIcon: {
    marginBottom: spacing.md,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 3,
  },
  quickSubtitle: {
    fontSize: 12,
    color: colors.textSubtle,
  },
});
