import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '@/constants/theme';

type Size = 'sm' | 'md' | 'lg' | 'xl';

type Tone = 'mint' | 'mintSoft' | 'grey' | 'transparent';

type Props = {
  size?: Size;
  tone?: Tone;
  style?: ViewStyle;
  children: React.ReactNode;
};

const SIZE_MAP: Record<Size, { box: number; radius: number }> = {
  sm: { box: 36, radius: 10 },
  md: { box: 40, radius: radius.lg },
  lg: { box: 44, radius: radius.lg },
  xl: { box: 48, radius: radius.xxl },
};

const TONE_MAP: Record<Tone, string> = {
  mint: colors.primarySurface,
  mintSoft: colors.primarySurfaceAlt,
  grey: colors.bgBlueGrey,
  transparent: 'transparent',
};

export function IconBadge({ size = 'md', tone = 'mint', style, children }: Props) {
  const sz = SIZE_MAP[size];
  return (
    <View
      style={[
        styles.box,
        {
          width: sz.box,
          height: sz.box,
          borderRadius: sz.radius,
          backgroundColor: TONE_MAP[tone],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
