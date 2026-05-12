import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontWeight, layout, spacing } from '@/constants/theme';
import { BrandMark } from './BrandMark';

type Props = {
  title: string;
  subtitle: string;
};

export function AuthHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <BrandMark variant="onPrimary" label="MPericias" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingTop: layout.authHeaderTop,
    paddingBottom: 80,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginHorizontal: -spacing.xxl,
  },
  brand: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: fontWeight.black,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.onPrimary85,
    textAlign: 'center',
    lineHeight: 20,
  },
});
