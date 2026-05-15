import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, fontWeight, layout, radius, shadow, spacing } from '@/constants/theme';
import {
  Button,
  HeaderBar,
  IconBadge,
  Screen,
  StatusBadge,
} from '@/components/ui';
import { PASSOS_PERICIA } from '@/data/pericia';
import type { Passo } from '@/types/domain';

export default function PericiaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen background={colors.bgGreyLight}>
      <HeaderBar
        variant="compact"
        onBack={() => router.back()}
        backIcon="close"
        centerSlot={
          <View style={styles.headerCenter}>
            <Text style={styles.topSubtitle}>CENTRAL DE AÇÃO</Text>
            <Text style={styles.topTitle}>Caso {id ?? '#4925-23'}</Text>
          </View>
        }
        rightSlot={
          <View style={styles.iconBtn}>
            <Ionicons name="share-outline" size={20} color={colors.text} />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <StatusBadge
              label="AGUARDANDO INÍCIO"
              bg={colors.onPrimary18}
              color={colors.white}
              size="md"
            />
            <Text style={styles.heroTime}>Hoje, 09:30</Text>
          </View>
          <Text style={styles.heroName}>Beatriz Mendonça</Text>
          <Text style={styles.heroMeta}>Avaliação Funcional • Unidade Centro</Text>
        </View>

        <Text style={styles.sectionLabel}>ROTEIRO DA PERÍCIA</Text>

        <View style={styles.stepList}>
          {PASSOS_PERICIA.map((passo) => (
            <StepCard key={passo.numero} passo={passo} />
          ))}
        </View>

        <View style={styles.infoCard}>
          <InfoCol label="DOCUMENTOS" icon="attach" value="4 anexos" />
          <View style={styles.infoDivider} />
          <InfoCol label="LOCALIZAÇÃO" icon="location-outline" value="Consultório 04" />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="INICIAR PERÍCIA"
          variant="primaryDark"
          iconRight={<Ionicons name="play" size={14} color={colors.white} />}
          textStyle={styles.primaryBtnText}
        />
        <View style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>REAGENDAR AVALIAÇÃO</Text>
        </View>
      </View>
    </Screen>
  );
}

function StepCard({ passo }: { passo: Passo }) {
  const isCurrent = passo.state === 'current';
  const isDone = passo.state === 'done';
  const isPending = passo.state === 'pending';

  return (
    <View style={[styles.stepCard, isCurrent && styles.stepCardCurrent]}>
      <IconBadge size="lg" tone={isPending ? 'grey' : 'mint'}>
        <MaterialCommunityIcons
          name={passo.icon}
          size={22}
          color={isPending ? colors.textPlaceholder : colors.primaryDark}
        />
      </IconBadge>
      <View style={styles.stepTextWrap}>
        <Text
          style={[
            styles.stepLabel,
            isCurrent && styles.stepLabelCurrent,
            isPending && styles.stepLabelPending,
          ]}
        >
          {isCurrent ? 'ATUAL' : `PASSO ${passo.numero}`}
        </Text>
        <Text style={[styles.stepTitle, isPending && styles.stepTitlePending]}>
          {passo.titulo}
        </Text>
      </View>
      {isDone && (
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={16} color={colors.white} />
        </View>
      )}
    </View>
  );
}

function InfoCol({
  label,
  icon,
  value,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View style={styles.infoCol}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueRow}>
        <Ionicons name={icon} size={15} color={colors.primary} />
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCenter: {
    alignItems: 'center',
  },
  topSubtitle: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textSubtle,
    letterSpacing: 1,
  },
  topTitle: {
    fontSize: 14,
    fontWeight: fontWeight.black,
    color: colors.primaryDark,
    marginTop: 2,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.bgBlueGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  heroCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.modal,
    padding: spacing.xl,
    marginTop: spacing.xs,
    marginBottom: 22,
    ...shadow.primaryDark,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTime: {
    fontSize: 13,
    color: colors.onPrimary90,
    fontWeight: fontWeight.semibold,
  },
  heroName: {
    fontSize: 26,
    fontWeight: fontWeight.black,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  heroMeta: {
    fontSize: 14,
    color: colors.onPrimary88,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.textSubtle,
    letterSpacing: 1,
    marginBottom: 10,
  },
  stepList: { gap: 10 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...shadow.soft,
  },
  stepCardCurrent: {
    borderColor: colors.primaryDark,
  },
  stepTextWrap: { flex: 1 },
  stepLabel: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.textSubtle,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  stepLabelCurrent: { color: colors.primaryDark },
  stepLabelPending: { color: colors.textPlaceholder },
  stepTitle: {
    fontSize: 15,
    fontWeight: fontWeight.black,
    color: colors.text,
  },
  stepTitlePending: { color: colors.textSubtle },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textPlaceholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
    ...shadow.soft,
  },
  infoCol: {
    flex: 1,
    paddingHorizontal: 18,
  },
  infoDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.bgBlueGrey,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textSubtle,
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
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: layout.iosBottomSafeSm,
    backgroundColor: colors.bgGreyLight,
    borderTopWidth: 1,
    borderTopColor: colors.bgBlueGrey,
  },
  primaryBtnText: {
    fontSize: 15,
    letterSpacing: 1,
  },
  secondaryAction: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: fontWeight.black,
    color: colors.textSubtle,
    letterSpacing: 1,
  },
});
