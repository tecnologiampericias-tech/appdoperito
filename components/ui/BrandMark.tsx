import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fontWeight } from '@/constants/theme';

const LOGO = require('@/assets/images/logo.png');

type Variant = 'onLight' | 'onPrimary';

type Props = {
  variant?: Variant;
  label?: string;
};

export function BrandMark({ variant = 'onLight', label = 'Expertise Digital' }: Props) {
  const isOnPrimary = variant === 'onPrimary';
  return (
    <View style={styles.row}>
      <Image
        source={LOGO}
        style={[
          styles.logo,
          isOnPrimary ? styles.logoOnPrimary : styles.logoOnLight,
        ]}
        resizeMode="contain"
      />
      <Text
        style={[
          styles.label,
          { color: isOnPrimary ? colors.white : colors.primaryDarker },
          isOnPrimary && styles.labelOnPrimary,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoOnPrimary: {
    width: 36,
    height: 36,
  },
  logoOnLight: {
    // logo é branca; em fundo claro precisa de tonalidade — tintColor pinta a logo na cor primária
    tintColor: colors.primary,
  },
  label: {
    fontSize: 17,
    fontWeight: fontWeight.bold,
  },
  labelOnPrimary: {
    fontSize: 20,
    letterSpacing: 0.3,
  },
});
