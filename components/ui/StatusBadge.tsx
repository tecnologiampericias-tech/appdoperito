import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fontWeight, radius } from '@/constants/theme';
import type { StatusTone } from '@/types/domain';
import { styleForTone } from '@/data/status';

type Props = {
  label: string;
  tone?: StatusTone;
  bg?: string;
  color?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
};

export function StatusBadge({
  label,
  tone,
  bg,
  color,
  size = 'sm',
  style,
}: Props) {
  const visual = tone ? styleForTone(tone) : { bg: bg ?? colors.primaryTint, color: color ?? colors.primaryDark };
  const isMd = size === 'md';
  return (
    <View
      style={[
        styles.badge,
        isMd ? styles.md : styles.sm,
        { backgroundColor: visual.bg },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: visual.color },
          isMd && styles.textMd,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.md,
  },
  sm: {
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  text: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
  textMd: {
    letterSpacing: 0.6,
  },
});
