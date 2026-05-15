import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors } from '@/constants/theme';

const LOGO = require('@/assets/images/logo.png');

type Variant = 'onLight' | 'onPrimary';

type Props = {
  variant?: Variant;
};

export function BrandMark({ variant = 'onLight' }: Props) {
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
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 56,
    height: 56,
  },
  logoOnPrimary: {
    width: 88,
    height: 88,
  },
  logoOnLight: {
    tintColor: colors.primary,
  },
});
