import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '@/constants/theme';

type Elevation = 'none' | 'soft' | 'medium' | 'high';

type Props = ViewProps & {
  elevation?: Elevation;
  padded?: boolean;
  style?: ViewStyle | ViewStyle[];
};

const ELEVATION_MAP = {
  none: shadow.none,
  soft: shadow.soft,
  medium: shadow.card,
  high: shadow.cardLg,
} as const;

export function Card({
  elevation = 'medium',
  padded = true,
  style,
  children,
  ...rest
}: Props) {
  return (
    <View
      style={[
        styles.base,
        padded && styles.padded,
        ELEVATION_MAP[elevation],
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
  },
  padded: {
    padding: spacing.lg + 2,
  },
});
