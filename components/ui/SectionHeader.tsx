import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors, fontWeight, spacing } from '@/constants/theme';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

export function SectionHeader({ title, actionLabel, onAction, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

type LabelProps = {
  children: string;
  style?: ViewStyle;
};

export function Eyebrow({ children, style }: LabelProps) {
  return <Text style={[styles.eyebrow, style as any]}>{children}</Text>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: fontWeight.black,
    color: colors.text,
  },
  action: {
    fontSize: 13,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.textSubtle,
    letterSpacing: 1,
  },
});
