import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fontWeight, spacing } from '@/constants/theme';

type Props = {
  label?: string;
  style?: ViewStyle;
};

export function Divider({ label, style }: Props) {
  if (!label) {
    return <View style={[styles.line, style]} />;
  }
  return (
    <View style={[styles.container, style]}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl + 2,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    marginHorizontal: spacing.lg,
    fontSize: 13,
    fontWeight: fontWeight.medium,
    color: colors.textPlaceholder,
  },
});
