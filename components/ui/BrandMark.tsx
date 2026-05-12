import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontWeight, radius } from '@/constants/theme';

type Variant = 'onLight' | 'onPrimary';

type Props = {
  variant?: Variant;
  label?: string;
};

export function BrandMark({ variant = 'onLight', label = 'Expertise Digital' }: Props) {
  const isOnPrimary = variant === 'onPrimary';
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.icon,
          { backgroundColor: isOnPrimary ? colors.white : colors.primary },
        ]}
      >
        <Ionicons
          name="medical"
          size={isOnPrimary ? 20 : 16}
          color={isOnPrimary ? colors.primary : colors.white}
        />
      </View>
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
  icon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
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
